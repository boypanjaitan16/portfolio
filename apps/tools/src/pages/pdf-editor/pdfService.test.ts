import {
	decodePDFRawStream,
	type PDFArray,
	PDFDocument,
	type PDFRawStream,
} from "pdf-lib";
import { describe, expect, it } from "vitest";
import encryptedPdfBase64 from "./fixtures/encrypted.pdf.base64?raw";
import { type EditorPage, movePage, type SourceDocument } from "./pdfModel";
import { exportPdf, openPdf } from "./pdfService";

async function fixture() {
	const document = await PDFDocument.create();
	document.addPage([300, 400]);
	document.addPage([500, 600]);
	const source = {
		id: "source",
		name: "sample.pdf",
		bytes: await document.save(),
	} as SourceDocument;
	const pages: EditorPage[] = [
		{
			id: "first",
			sourceId: source.id,
			sourceIndex: 0,
			width: 300,
			height: 400,
			originX: 0,
			originTop: 400,
			originalRotation: 0,
			rotation: 0,
			selected: false,
			annotations: [],
		},
		{
			id: "second",
			sourceId: source.id,
			sourceIndex: 1,
			width: 500,
			height: 600,
			originX: 0,
			originTop: 600,
			originalRotation: 0,
			rotation: 90,
			selected: true,
			annotations: [],
		},
	];
	return { source, pages };
}

describe("PDF export", () => {
	it("keeps the workspace page order and rotation in the downloaded PDF", async () => {
		const { source, pages } = await fixture();
		const reordered = movePage(pages, 1, -1);
		const bytes = await exportPdf(reordered, [source]);
		const result = await PDFDocument.load(bytes);
		expect(result.getPageCount()).toBe(2);
		expect(result.getPage(0).getWidth()).toBe(500);
		expect(result.getPage(0).getRotation().angle).toBe(90);
		expect(result.getPage(1).getWidth()).toBe(300);
	});

	it("exports only the supplied selected pages into one PDF", async () => {
		const { source, pages } = await fixture();
		const bytes = await exportPdf(
			pages.filter((page) => page.selected),
			[source],
		);
		const result = await PDFDocument.load(bytes);
		expect(result.getPageCount()).toBe(1);
		expect(result.getPage(0).getWidth()).toBe(500);
	});

	it("merges pages from different PDF files", async () => {
		const { source, pages } = await fixture();
		const otherDocument = await PDFDocument.create();
		otherDocument.addPage([700, 800]);
		const otherSource = {
			id: "other",
			name: "other.pdf",
			bytes: await otherDocument.save(),
		} as SourceDocument;
		const otherPage = {
			...pages[0],
			id: "other-page",
			sourceId: "other",
			sourceIndex: 0,
			width: 700,
			height: 800,
			originTop: 800,
		};
		const bytes = await exportPdf(
			[pages[0], otherPage, pages[1]],
			[source, otherSource],
		);
		const result = await PDFDocument.load(bytes);
		expect(result.getPages().map((page) => page.getWidth())).toEqual([
			300, 700, 500,
		]);
	});

	it("places an image at the same top-left coordinates used in the preview", async () => {
		const { source, pages } = await fixture();
		const dataUrl =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAHElEQVR4AYTIoREAAACCQI/9d9asRWiP3KPpQwAAAP//yH46pQAAAAZJREFUAwDXzwgBKMyBrQAAAABJRU5ErkJggg==";
		const page = {
			...pages[0],
			annotations: [
				{
					id: "image",
					type: "image" as const,
					x: 50,
					y: 80,
					width: 100,
					height: 30,
					dataUrl,
				},
			],
		};
		const bytes = await exportPdf([page], [source]);
		const result = await PDFDocument.load(bytes);
		const contents = result.context.lookup(
			result.getPage(0).node.Contents(),
		) as PDFArray;
		const stream = result.context.lookup(contents.asArray()[0]) as PDFRawStream;
		const operators = new TextDecoder().decode(
			decodePDFRawStream(stream).decode(),
		);
		expect(operators).toContain("1 0 0 1 50 290 cm");
		expect(operators).toContain("100 0 0 30 0 0 cm");
	});
});

describe("PDF input", () => {
	it("identifies encrypted PDFs before starting the preview worker", async () => {
		const bytes = Uint8Array.from(atob(encryptedPdfBase64), (character) =>
			character.charCodeAt(0),
		);
		const file = {
			name: "encrypted.pdf",
			arrayBuffer: async () => Uint8Array.from(bytes).buffer,
		} as File;
		await expect(openPdf(file)).rejects.toThrow("encrypted");
	});

	it("rejects corrupt PDFs", async () => {
		const file = {
			name: "corrupt.pdf",
			arrayBuffer: async () => new TextEncoder().encode("not a PDF").buffer,
		} as File;
		await expect(openPdf(file)).rejects.toThrow("invalid");
	});
});
