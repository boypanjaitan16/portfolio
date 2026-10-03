/** Helpers shared by tools that open local images and encode them via Canvas. */

export type ExportFormat = "image/png" | "image/jpeg" | "image/webp";

export const exportFormats: readonly ExportFormat[] = [
	"image/png",
	"image/jpeg",
	"image/webp",
];

export const formatLabels: Record<ExportFormat, string> = {
	"image/png": "PNG",
	"image/jpeg": "JPEG",
	"image/webp": "WebP",
};

export const defaultQuality = 92;
export const maxImageFileBytes = 50 * 1024 * 1024;
export const maxImagePixels = 50_000_000;
export const imageAccept =
	".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";

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

export function acceptsImage(file: Pick<File, "type" | "name">): boolean {
	if (file.type) return exportFormats.includes(file.type as ExportFormat);
	return /\.(png|jpe?g|webp)$/i.test(file.name);
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

/** `holiday.jpeg` with suffix `edited` and WebP becomes `holiday-edited.webp`. */
export function outputFileName(
	name: string,
	suffix: string,
	format: ExportFormat,
): string {
	const base = name.replace(/\.[^./\\]+$/, "").trim() || "image";
	return `${base}-${suffix}.${extensions[format]}`;
}

/**
 * Encodes a canvas and releases its pixels. Quality is a percentage and is
 * ignored for PNG. Browsers fall back to PNG for formats they cannot encode,
 * so a different MIME type is reported as `formatUnsupported`.
 */
export function canvasToBlob(
	canvas: HTMLCanvasElement,
	format: ExportFormat,
	quality: number,
	{ release = true }: { release?: boolean } = {},
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (release) {
					canvas.width = 0;
					canvas.height = 0;
				}
				if (!blob) reject(new ExportError("exportFailed"));
				else if (blob.type && blob.type !== format)
					reject(new ExportError("formatUnsupported"));
				else resolve(blob);
			},
			format,
			hasQuality(format) ? quality / 100 : undefined,
		);
	});
}
