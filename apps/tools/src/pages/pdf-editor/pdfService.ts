import fontUrl from "./assets/DejaVuSans.ttf?url";
import type { EditorPage, SourceDocument } from "./pdfModel";

export async function openPdf(
	file: File,
): Promise<{ source: SourceDocument; pages: EditorPage[] }> {
	const { PDFDocument, EncryptedPDFError } = await import("pdf-lib");
	const bytes = new Uint8Array(await file.arrayBuffer());
	let document: Awaited<ReturnType<typeof PDFDocument.load>>;
	try {
		document = await PDFDocument.load(bytes);
	} catch (error) {
		if (
			error instanceof EncryptedPDFError ||
			(error instanceof Error && /encrypted/i.test(error.message))
		)
			throw new Error("encrypted");
		throw new Error("invalid");
	}
	const pdfjs = await import("pdfjs-dist");
	const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url"))
		.default;
	pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
	const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
	let preview: Awaited<typeof loadingTask.promise>;
	try {
		preview = await loadingTask.promise;
	} catch {
		await loadingTask.destroy();
		throw new Error("invalid");
	}
	try {
		const sourceId = crypto.randomUUID();
		const pages: EditorPage[] = [];
		for (let index = 0; index < document.getPageCount(); index += 1) {
			const page = await preview.getPage(index + 1);
			const viewport = page.getViewport({ scale: 1, rotation: 0 });
			pages.push({
				id: crypto.randomUUID(),
				sourceId,
				sourceIndex: index,
				width: viewport.width,
				height: viewport.height,
				originX: page.view[0],
				originTop: page.view[3],
				originalRotation: page.rotate,
				rotation: 0,
				selected: false,
				annotations: [],
			});
		}
		return {
			source: { id: sourceId, name: file.name, bytes, preview, loadingTask },
			pages,
		};
	} catch (error) {
		await loadingTask.destroy();
		throw error;
	}
}

export async function exportPdf(
	pages: EditorPage[],
	sources: SourceDocument[],
): Promise<Uint8Array> {
	if (pages.length === 0) throw new Error("empty");
	const {
		PDFDocument,
		clip,
		degrees,
		endPath,
		popGraphicsState,
		pushGraphicsState,
		rectangle,
		rgb,
	} = await import("pdf-lib");
	const output = await PDFDocument.create();
	const sourceDocuments = new Map<
		string,
		Awaited<ReturnType<typeof PDFDocument.load>>
	>();
	const imageCache = new Map<
		string,
		Awaited<ReturnType<typeof output.embedPng>>
	>();
	let font: Awaited<ReturnType<typeof output.embedFont>> | undefined;
	if (
		pages.some((page) =>
			page.annotations.some((item) => item.type === "text" && item.text.trim()),
		)
	) {
		const fontkit = await import("@pdf-lib/fontkit");
		output.registerFontkit(fontkit.default);
		const fontBytes = await fetch(fontUrl).then((response) => {
			if (!response.ok) throw new Error("font");
			return response.arrayBuffer();
		});
		font = await output.embedFont(fontBytes, { subset: true });
	}
	for (const entry of pages) {
		const source = sources.find((item) => item.id === entry.sourceId);
		if (!source) throw new Error("missing-source");
		let sourceDocument = sourceDocuments.get(source.id);
		if (!sourceDocument) {
			sourceDocument = await PDFDocument.load(source.bytes);
			sourceDocuments.set(source.id, sourceDocument);
		}
		const [copied] = await output.copyPages(sourceDocument, [
			entry.sourceIndex,
		]);
		output.addPage(copied);
		copied.setRotation(
			degrees((((entry.originalRotation + entry.rotation) % 360) + 360) % 360),
		);
		for (const annotation of entry.annotations) {
			if (annotation.type === "text") {
				if (!annotation.text.trim() || !font) continue;
				const color = annotation.color.replace("#", "");
				copied.pushOperators(
					pushGraphicsState(),
					rectangle(
						entry.originX + annotation.x,
						entry.originTop - annotation.y - annotation.height,
						annotation.width,
						annotation.height,
					),
					clip(),
					endPath(),
				);
				copied.drawText(annotation.text, {
					x: entry.originX + annotation.x,
					y: entry.originTop - annotation.y - annotation.fontSize,
					maxWidth: annotation.width,
					lineHeight: annotation.fontSize * 1.25,
					size: annotation.fontSize,
					font,
					color: rgb(
						Number.parseInt(color.slice(0, 2), 16) / 255,
						Number.parseInt(color.slice(2, 4), 16) / 255,
						Number.parseInt(color.slice(4, 6), 16) / 255,
					),
				});
				copied.pushOperators(popGraphicsState());
			} else {
				let image = imageCache.get(annotation.dataUrl);
				if (!image) {
					image = annotation.dataUrl.startsWith("data:image/png")
						? await output.embedPng(annotation.dataUrl)
						: await output.embedJpg(annotation.dataUrl);
					imageCache.set(annotation.dataUrl, image);
				}
				copied.drawImage(image, {
					x: entry.originX + annotation.x,
					y: entry.originTop - annotation.y - annotation.height,
					width: annotation.width,
					height: annotation.height,
				});
			}
		}
	}
	return output.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
	const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.append(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
