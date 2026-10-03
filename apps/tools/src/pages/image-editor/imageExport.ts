import {
	type CropRect,
	drawTransformed,
	type Size,
	type Transform,
} from "./imageTransformModel";

export type ExportFormat = "image/png" | "image/jpeg" | "image/webp";

export const exportFormats: readonly ExportFormat[] = [
	"image/png",
	"image/jpeg",
	"image/webp",
];

export const defaultQuality = 92;

const extensions: Record<ExportFormat, string> = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/webp": "webp",
};

export type ExportErrorCode = "formatUnsupported" | "exportFailed";

export class ExportError extends Error {
	readonly code: ExportErrorCode;

	constructor(code: ExportErrorCode) {
		super(code);
		this.code = code;
	}
}

export function formatForFile(file: Pick<File, "type" | "name">): ExportFormat {
	if (exportFormats.includes(file.type as ExportFormat))
		return file.type as ExportFormat;
	if (/\.jpe?g$/i.test(file.name)) return "image/jpeg";
	if (/\.webp$/i.test(file.name)) return "image/webp";
	return "image/png";
}

export function hasQuality(format: ExportFormat): boolean {
	return format !== "image/png";
}

export function exportFileName(name: string, format: ExportFormat): string {
	const base = name.replace(/\.[^./\\]+$/, "").trim() || "image";
	return `${base}-edited.${extensions[format]}`;
}

/**
 * Re-encodes the visible pixels into a new file. Nothing from the source file
 * is copied, so EXIF, GPS, XMP, IPTC, ICC, and text metadata are left behind.
 */
export function exportImage(
	image: CanvasImageSource,
	source: Size,
	transform: Transform,
	crop: CropRect,
	format: ExportFormat,
	quality: number,
): Promise<Blob> {
	const canvas = document.createElement("canvas");
	canvas.width = crop.width;
	canvas.height = crop.height;
	const context = canvas.getContext("2d", { colorSpace: "srgb" });
	if (!context) return Promise.reject(new ExportError("exportFailed"));
	if (format === "image/jpeg") {
		// JPEG has no transparency; empty straightened corners become white.
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, crop.width, crop.height);
	}
	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = "high";
	drawTransformed(context, image, source, transform, crop);
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				canvas.width = 0;
				canvas.height = 0;
				if (!blob) reject(new ExportError("exportFailed"));
				// Browsers fall back to PNG for formats they cannot encode.
				else if (blob.type && blob.type !== format)
					reject(new ExportError("formatUnsupported"));
				else resolve(blob);
			},
			format,
			hasQuality(format) ? quality / 100 : undefined,
		);
	});
}

export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.append(link);
	try {
		link.click();
	} finally {
		link.remove();
		window.setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
}
