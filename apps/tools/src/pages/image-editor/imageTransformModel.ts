export type QuarterTurns = 0 | 1 | 2 | 3;

export type Transform = {
	quarterTurns: QuarterTurns;
	flipX: boolean;
	flipY: boolean;
	/** Straightening angle in degrees, applied after the quarter turns. */
	angle: number;
};

export type Size = { width: number; height: number };

export type CropRect = { x: number; y: number; width: number; height: number };

export type CropHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type AspectPreset = "free" | "original" | "1:1" | "4:3" | "3:2" | "16:9";

export const aspectPresets: readonly AspectPreset[] = [
	"free",
	"original",
	"1:1",
	"4:3",
	"3:2",
	"16:9",
];

export const angleMin = -45;
export const angleMax = 45;

export const identityTransform: Transform = {
	quarterTurns: 0,
	flipX: false,
	flipY: false,
	angle: 0,
};

const minCropSize = 1;

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function roundSize(value: number): number {
	// Trigonometry leaves tiny errors such as 99.99999999 for exact turns.
	return Math.max(1, Math.round(Math.round(value * 1e6) / 1e6));
}

/** True when exactly one axis is flipped, which reverses visual rotation. */
export function isMirrored(transform: Transform): boolean {
	return transform.flipX !== transform.flipY;
}

export function rotationRadians(transform: Transform): number {
	return ((transform.quarterTurns * 90 + transform.angle) * Math.PI) / 180;
}

/** Image size after quarter turns, before straightening. */
export function turnedSize(source: Size, transform: Transform): Size {
	return transform.quarterTurns % 2 === 0
		? { width: source.width, height: source.height }
		: { width: source.height, height: source.width };
}

/** Bounding box of the fully transformed image; crop coordinates live here. */
export function transformedSize(source: Size, transform: Transform): Size {
	const radians = rotationRadians(transform);
	const cos = Math.abs(Math.cos(radians));
	const sin = Math.abs(Math.sin(radians));
	return {
		width: roundSize(source.width * cos + source.height * sin),
		height: roundSize(source.width * sin + source.height * cos),
	};
}

/** Turns the image visually clockwise (1) or counter-clockwise (-1). */
export function rotateVisually(
	transform: Transform,
	direction: 1 | -1,
): Transform {
	const delta = isMirrored(transform) ? -direction : direction;
	return {
		...transform,
		quarterTurns: ((((transform.quarterTurns + delta) % 4) + 4) %
			4) as QuarterTurns,
	};
}

/** The straightening angle as seen on screen, where clockwise is positive. */
export function visualAngle(transform: Transform): number {
	const angle = isMirrored(transform) ? -transform.angle : transform.angle;
	return angle === 0 ? 0 : angle;
}

export function withVisualAngle(
	transform: Transform,
	angle: number,
): Transform {
	const value = clamp(Number.isFinite(angle) ? angle : 0, angleMin, angleMax);
	const stored = isMirrored(transform) ? -value : value;
	return { ...transform, angle: stored === 0 ? 0 : stored };
}

/**
 * Largest axis-aligned rectangle inside the turned image after straightening,
 * centered in the bounding box, so the default crop has no empty corners.
 */
export function largestInscribedRect(
	source: Size,
	transform: Transform,
): CropRect {
	const base = turnedSize(source, transform);
	const bounds = transformedSize(source, transform);
	const radians = (Math.abs(transform.angle) * Math.PI) / 180;
	const sin = Math.sin(radians);
	const cos = Math.cos(radians);
	const longIsWidth = base.width >= base.height;
	const long = longIsWidth ? base.width : base.height;
	const short = longIsWidth ? base.height : base.width;
	let width: number;
	let height: number;
	if (sin < 1e-10) {
		width = base.width;
		height = base.height;
	} else if (short <= 2 * sin * cos * long || Math.abs(sin - cos) < 1e-10) {
		const half = short / 2;
		width = longIsWidth ? half / sin : half / cos;
		height = longIsWidth ? half / cos : half / sin;
	} else {
		const cos2 = cos * cos - sin * sin;
		width = (base.width * cos - base.height * sin) / cos2;
		height = (base.height * cos - base.width * sin) / cos2;
	}
	width = clamp(Math.floor(width + 1e-6), minCropSize, bounds.width);
	height = clamp(Math.floor(height + 1e-6), minCropSize, bounds.height);
	return {
		x: Math.floor((bounds.width - width) / 2),
		y: Math.floor((bounds.height - height) / 2),
		width,
		height,
	};
}

/** Width-to-height ratio for a preset, oriented like the current image. */
export function aspectRatio(
	preset: AspectPreset,
	source: Size,
	transform: Transform,
): number | null {
	if (preset === "free") return null;
	const base = turnedSize(source, transform);
	if (preset === "original") return base.width / base.height;
	const [a, b] = preset.split(":").map(Number);
	return base.width >= base.height ? a / b : b / a;
}

/** Largest rectangle with the ratio that fits inside the area, centered on it. */
export function fitAspect(area: CropRect, ratio: number | null): CropRect {
	if (!ratio) return area;
	let width = area.width;
	let height = width / ratio;
	if (height > area.height) {
		height = area.height;
		width = height * ratio;
	}
	width = Math.max(minCropSize, Math.round(width));
	height = Math.max(minCropSize, Math.round(height));
	return {
		x: area.x + Math.floor((area.width - width) / 2),
		y: area.y + Math.floor((area.height - height) / 2),
		width: Math.min(width, area.width),
		height: Math.min(height, area.height),
	};
}

export function defaultCrop(
	source: Size,
	transform: Transform,
	preset: AspectPreset,
): CropRect {
	return fitAspect(
		largestInscribedRect(source, transform),
		aspectRatio(preset, source, transform),
	);
}

export function clampCrop(rect: CropRect, bounds: Size): CropRect {
	const width = clamp(Math.round(rect.width), minCropSize, bounds.width);
	const height = clamp(Math.round(rect.height), minCropSize, bounds.height);
	return {
		x: clamp(Math.round(rect.x), 0, bounds.width - width),
		y: clamp(Math.round(rect.y), 0, bounds.height - height),
		width,
		height,
	};
}

export function moveCrop(
	rect: CropRect,
	dx: number,
	dy: number,
	bounds: Size,
): CropRect {
	return clampCrop({ ...rect, x: rect.x + dx, y: rect.y + dy }, bounds);
}

/** Mirrors the crop with the image so it keeps covering the same content. */
export function flipCrop(
	rect: CropRect,
	axis: "x" | "y",
	bounds: Size,
): CropRect {
	return axis === "x"
		? { ...rect, x: bounds.width - rect.x - rect.width }
		: { ...rect, y: bounds.height - rect.y - rect.height };
}

export function resizeCrop(
	start: CropRect,
	handle: CropHandle,
	dx: number,
	dy: number,
	bounds: Size,
	ratio: number | null,
): CropRect {
	const left0 = start.x;
	const top0 = start.y;
	const right0 = start.x + start.width;
	const bottom0 = start.y + start.height;
	const west = handle.includes("w");
	const east = handle.includes("e");
	const north = handle.includes("n");
	const south = handle.includes("s");
	let left = west ? clamp(left0 + dx, 0, right0 - minCropSize) : left0;
	let right = east
		? clamp(right0 + dx, left0 + minCropSize, bounds.width)
		: right0;
	let top = north ? clamp(top0 + dy, 0, bottom0 - minCropSize) : top0;
	let bottom = south
		? clamp(bottom0 + dy, top0 + minCropSize, bounds.height)
		: bottom0;
	if (!ratio) {
		return clampCrop(
			{ x: left, y: top, width: right - left, height: bottom - top },
			bounds,
		);
	}
	const horizontal = west || east;
	const vertical = north || south;
	let width = right - left;
	let height = bottom - top;
	if (horizontal && vertical) {
		if (width / height > ratio) height = width / ratio;
		else width = height * ratio;
	} else if (horizontal) height = width / ratio;
	else width = height * ratio;

	const centerX = (left0 + right0) / 2;
	const centerY = (top0 + bottom0) / 2;
	const maxWidth = west
		? right0
		: east
			? bounds.width - left0
			: 2 * Math.min(centerX, bounds.width - centerX);
	const maxHeight = north
		? bottom0
		: south
			? bounds.height - top0
			: 2 * Math.min(centerY, bounds.height - centerY);
	if (width > maxWidth) {
		width = maxWidth;
		height = width / ratio;
	}
	if (height > maxHeight) {
		height = maxHeight;
		width = height * ratio;
	}
	left = west ? right0 - width : east ? left0 : centerX - width / 2;
	top = north ? bottom0 - height : south ? top0 : centerY - height / 2;
	right = left + width;
	bottom = top + height;
	return clampCrop(
		{ x: left, y: top, width: right - left, height: bottom - top },
		bounds,
	);
}

export type CropField = keyof CropRect;

/** Applies a numeric field edit, keeping the ratio by adjusting the other side. */
export function setCropField(
	rect: CropRect,
	field: CropField,
	value: number,
	bounds: Size,
	ratio: number | null,
): CropRect {
	if (!Number.isFinite(value)) return rect;
	const next = { ...rect, [field]: value };
	if (ratio && field === "width") {
		next.width = Math.min(value, bounds.width, bounds.height * ratio);
		next.height = next.width / ratio;
	} else if (ratio && field === "height") {
		next.height = Math.min(value, bounds.height, bounds.width / ratio);
		next.width = next.height * ratio;
	}
	return clampCrop(next, bounds);
}

type DrawContext = Pick<
	CanvasRenderingContext2D,
	"translate" | "scale" | "rotate" | "drawImage"
>;

/**
 * Draws the transformed image so that the crop's top-left corner lands at the
 * canvas origin. Preview and export share this to keep geometry identical.
 */
export function drawTransformed(
	context: DrawContext,
	image: CanvasImageSource,
	source: Size,
	transform: Transform,
	crop: Pick<CropRect, "x" | "y">,
): void {
	const bounds = transformedSize(source, transform);
	context.translate(-crop.x, -crop.y);
	context.translate(bounds.width / 2, bounds.height / 2);
	context.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
	context.rotate(rotationRadians(transform));
	context.drawImage(image, -source.width / 2, -source.height / 2);
}
