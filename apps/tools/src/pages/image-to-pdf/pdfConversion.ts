import {
	acceptsImage,
	canvasToBlob,
	formatForFile,
	maxImageFileBytes,
	maxImagePixels,
} from "../../shared/imageFiles";

export type PageSize = "a4" | "letter" | "image";
export type ImageInfo = { width: number; height: number };
export type ConversionErrorCode =
	| "unsupported"
	| "fileTooLarge"
	| "imageTooLarge"
	| "invalidImage"
	| "createFailed";

export class ConversionError extends Error {
	readonly code: ConversionErrorCode;
	readonly fileName?: string;

	constructor(code: ConversionErrorCode, fileName?: string, cause?: unknown) {
		super(code, { cause });
		this.code = code;
		this.fileName = fileName;
	}
}

export const maxItems = 30;
export const maxImageDimension = 16_384;

const a4 = { width: 595.28, height: 841.89 };
const letter = { width: 612, height: 792 };
const margin = (10 / 25.4) * 72;
const maxDpi = 300;

export type PageLayout = {
	width: number;
	height: number;
	x: number;
	y: number;
	imageWidth: number;
	imageHeight: number;
};

export function pageLayout(image: ImageInfo, size: PageSize): PageLayout {
	let width: number;
	let height: number;
	let inset = margin;
	if (size === "image") {
		const longest = Math.max(image.width, image.height);
		width = Math.max(1, (a4.height * image.width) / longest);
		height = Math.max(1, (a4.height * image.height) / longest);
		inset = 0;
	} else {
		const sheet = size === "a4" ? a4 : letter;
		const landscape = image.width > image.height;
		width = landscape ? sheet.height : sheet.width;
		height = landscape ? sheet.width : sheet.height;
	}
	const scale = Math.min(
		(width - 2 * inset) / image.width,
		(height - 2 * inset) / image.height,
	);
	const imageWidth = image.width * scale;
	const imageHeight = image.height * scale;
	return {
		width,
		height,
		x: (width - imageWidth) / 2,
		y: (height - imageHeight) / 2,
		imageWidth,
		imageHeight,
	};
}

function validateDimensions(bitmap: ImageInfo, fileName: string): ImageInfo {
	const { width, height } = bitmap;
	if (!width || !height) throw new ConversionError("invalidImage", fileName);
	if (
		width > maxImageDimension ||
		height > maxImageDimension ||
		width * height > maxImagePixels
	)
		throw new ConversionError("imageTooLarge", fileName);
	return { width, height };
}

async function openImage(file: File): Promise<ImageBitmap> {
	if (!acceptsImage(file)) throw new ConversionError("unsupported", file.name);
	if (file.size > maxImageFileBytes)
		throw new ConversionError("fileTooLarge", file.name);
	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
	} catch {
		throw new ConversionError("invalidImage", file.name);
	}
	try {
		validateDimensions(bitmap, file.name);
		return bitmap;
	} catch (error) {
		bitmap.close();
		throw error;
	}
}

export async function inspectImage(file: File): Promise<ImageInfo> {
	const bitmap = await openImage(file);
	try {
		return { width: bitmap.width, height: bitmap.height };
	} finally {
		bitmap.close();
	}
}

async function encodeImage(
	bitmap: ImageBitmap,
	file: File,
	layout: PageLayout,
): Promise<Uint8Array> {
	const scale = Math.min(
		1,
		(layout.imageWidth * maxDpi) / 72 / bitmap.width,
		(layout.imageHeight * maxDpi) / 72 / bitmap.height,
	);
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.floor(bitmap.width * scale));
	canvas.height = Math.max(1, Math.floor(bitmap.height * scale));
	const context = canvas.getContext("2d", { colorSpace: "srgb" });
	if (!context) throw new ConversionError("createFailed", file.name);
	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = "high";
	context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	const format =
		formatForFile(file) === "image/jpeg" ? "image/jpeg" : "image/png";
	try {
		const blob = await canvasToBlob(canvas, format, 92);
		return new Uint8Array(await blob.arrayBuffer());
	} catch {
		throw new ConversionError("createFailed", file.name);
	}
}

/** Builds a new PDF only after every image has been decoded and embedded. */
export async function imagesToPdf(
	files: readonly File[],
	size: PageSize,
): Promise<Uint8Array> {
	if (files.length === 0 || files.length > maxItems)
		throw new ConversionError("createFailed");
	const { PDFDocument } = await import("pdf-lib");
	const pdf = await PDFDocument.create();
	for (const file of files) {
		const bitmap = await openImage(file);
		try {
			const layout = pageLayout(bitmap, size);
			const bytes = await encodeImage(bitmap, file, layout);
			const image =
				formatForFile(file) === "image/jpeg"
					? await pdf.embedJpg(bytes)
					: await pdf.embedPng(bytes);
			const page = pdf.addPage([layout.width, layout.height]);
			page.drawImage(image, {
				x: layout.x,
				y: layout.y,
				width: layout.imageWidth,
				height: layout.imageHeight,
			});
		} catch (error) {
			if (error instanceof ConversionError) throw error;
			throw new ConversionError("createFailed", file.name, error);
		} finally {
			bitmap.close();
		}
	}
	return pdf.save();
}
