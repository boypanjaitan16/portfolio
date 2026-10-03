import {
	canvasToBlob,
	ExportError,
	type ExportErrorCode,
	type ExportFormat,
	formatForFile,
	hasQuality,
	maxImagePixels,
	outputFileName,
} from "../../shared/imageFiles";
import { type ResizeSettings, type Size, targetSize } from "./resizeModel";

export type OutputFormat = ExportFormat | "original";

export type CompressSettings = {
	format: OutputFormat;
	/** Percentage used for JPEG and WebP; the target search never exceeds it. */
	quality: number;
	/** Optional upper bound for JPEG and WebP output, in kilobytes. */
	targetKb: number | null;
	resize: ResizeSettings;
};

export type CompressResult = {
	blob: Blob;
	name: string;
	format: ExportFormat;
	width: number;
	height: number;
	quality: number | null;
	/** The target size was set but even the smallest attempt stayed above it. */
	targetMissed: boolean;
};

export type CompressErrorCode = "invalidImage" | "tooLarge" | ExportErrorCode;

export class CompressError extends Error {
	readonly code: CompressErrorCode;

	constructor(code: CompressErrorCode) {
		super(code);
		this.code = code;
	}
}

export const minSearchQuality = 10;
const searchSteps = 7;
const shrinkFactor = 0.85;
const maxShrinkAttempts = 6;

export function resolveFormat(
	file: Pick<File, "type" | "name">,
	format: OutputFormat,
): ExportFormat {
	return format === "original" ? formatForFile(file) : format;
}

/** True when the settings can use the target size search for this format. */
export function usesTarget(
	settings: Pick<CompressSettings, "targetKb">,
	format: ExportFormat,
): boolean {
	return (
		hasQuality(format) && settings.targetKb !== null && settings.targetKb > 0
	);
}

function createCanvas(size: Size): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.width = size.width;
	canvas.height = size.height;
	return canvas;
}

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
	const context = canvas.getContext("2d", { colorSpace: "srgb" });
	if (!context) throw new ExportError("exportFailed");
	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = "high";
	return context;
}

function release(canvas: HTMLCanvasElement) {
	canvas.width = 0;
	canvas.height = 0;
}

/**
 * Draws the image at the output size. Large reductions are halved in steps
 * first, which keeps detail that a single high-ratio downscale would alias.
 */
export function renderResized(
	image: CanvasImageSource,
	source: Size,
	size: Size,
	format: ExportFormat,
): HTMLCanvasElement {
	let current: CanvasImageSource = image;
	let currentSize = source;
	let intermediate: HTMLCanvasElement | null = null;
	while (
		currentSize.width / 2 >= size.width &&
		currentSize.height / 2 >= size.height
	) {
		const half = {
			width: Math.round(currentSize.width / 2),
			height: Math.round(currentSize.height / 2),
		};
		const step = createCanvas(half);
		context2d(step).drawImage(current, 0, 0, half.width, half.height);
		if (intermediate) release(intermediate);
		intermediate = step;
		current = step;
		currentSize = half;
	}
	const canvas = createCanvas(size);
	const context = context2d(canvas);
	if (format === "image/jpeg") {
		// JPEG has no transparency; transparent pixels become white.
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, size.width, size.height);
	}
	context.drawImage(current, 0, 0, size.width, size.height);
	if (intermediate) release(intermediate);
	return canvas;
}

type Encoded = { blob: Blob; size: Size; quality: number };

/**
 * Finds the highest quality at or below `maxQuality` that fits the target.
 * When even the lowest quality is too large, the dimensions shrink in steps.
 */
async function encodeForTarget(
	image: CanvasImageSource,
	source: Size,
	initialSize: Size,
	format: ExportFormat,
	maxQuality: number,
	targetBytes: number,
): Promise<Encoded & { targetMissed: boolean }> {
	let size = initialSize;
	let smallest: Encoded | null = null;
	for (let attempt = 0; attempt <= maxShrinkAttempts; attempt += 1) {
		const canvas = renderResized(image, source, size, format);
		try {
			const encode = (quality: number) =>
				canvasToBlob(canvas, format, quality, { release: false });
			const best = await encode(maxQuality);
			if (best.size <= targetBytes)
				return { blob: best, size, quality: maxQuality, targetMissed: false };
			const lowest = await encode(minSearchQuality);
			if (lowest.size <= targetBytes) {
				let fit: Encoded = { blob: lowest, size, quality: minSearchQuality };
				let low = minSearchQuality;
				let high = maxQuality;
				for (let step = 0; step < searchSteps && high - low > 1; step += 1) {
					const quality = Math.round((low + high) / 2);
					const blob = await encode(quality);
					if (blob.size <= targetBytes) {
						fit = { blob, size, quality };
						low = quality;
					} else high = quality;
				}
				return { ...fit, targetMissed: false };
			}
			if (!smallest || lowest.size < smallest.blob.size)
				smallest = { blob: lowest, size, quality: minSearchQuality };
		} finally {
			release(canvas);
		}
		const next = {
			width: Math.max(1, Math.round(size.width * shrinkFactor)),
			height: Math.max(1, Math.round(size.height * shrinkFactor)),
		};
		if (next.width === size.width && next.height === size.height) break;
		size = next;
	}
	if (!smallest) throw new ExportError("exportFailed");
	return { ...smallest, targetMissed: true };
}

/**
 * Re-encodes one image with Canvas. Output never carries the source file's
 * metadata, because only decoded pixels are drawn.
 */
export async function compressImage(
	file: File,
	settings: CompressSettings,
): Promise<CompressResult> {
	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
	} catch {
		throw new CompressError("invalidImage");
	}
	try {
		const source = { width: bitmap.width, height: bitmap.height };
		if (source.width < 1 || source.height < 1)
			throw new CompressError("invalidImage");
		if (source.width * source.height > maxImagePixels)
			throw new CompressError("tooLarge");
		const format = resolveFormat(file, settings.format);
		const size = targetSize(source, settings.resize);
		let encoded: Encoded & { targetMissed: boolean };
		if (usesTarget(settings, format)) {
			encoded = await encodeForTarget(
				bitmap,
				source,
				size,
				format,
				settings.quality,
				(settings.targetKb as number) * 1024,
			);
		} else {
			const canvas = renderResized(bitmap, source, size, format);
			const blob = await canvasToBlob(canvas, format, settings.quality);
			encoded = { blob, size, quality: settings.quality, targetMissed: false };
		}
		return {
			blob: encoded.blob,
			name: outputFileName(file.name, "compressed", format),
			format,
			width: encoded.size.width,
			height: encoded.size.height,
			quality: hasQuality(format) ? encoded.quality : null,
			targetMissed: encoded.targetMissed,
		};
	} catch (error) {
		if (error instanceof CompressError) throw error;
		if (error instanceof ExportError) throw new CompressError(error.code);
		throw new CompressError("exportFailed");
	} finally {
		bitmap.close();
	}
}
