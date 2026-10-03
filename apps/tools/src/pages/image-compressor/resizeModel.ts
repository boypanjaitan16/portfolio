export type Size = { width: number; height: number };

export type ResizeMode = "none" | "percent" | "dimensions" | "longestSide";

export const resizeModes: readonly ResizeMode[] = [
	"none",
	"percent",
	"dimensions",
	"longestSide",
];

export type ResizeSettings = {
	mode: ResizeMode;
	percent: number;
	/** Blank (null) sides are derived from the other side and the ratio. */
	width: number | null;
	height: number | null;
	keepRatio: boolean;
	longestSide: number;
	allowUpscale: boolean;
};

export const defaultResize: ResizeSettings = {
	mode: "none",
	percent: 50,
	width: 1920,
	height: null,
	keepRatio: true,
	longestSide: 1920,
	allowUpscale: false,
};

export const maxDimension = 16_384;

function positive(value: number | null): value is number {
	return value !== null && Number.isFinite(value) && value > 0;
}

function toPixels(value: number): number {
	return Math.max(1, Math.min(maxDimension, Math.round(value)));
}

/** Output size for one image; never enlarges unless `allowUpscale` is set. */
export function targetSize(source: Size, settings: ResizeSettings): Size {
	let width = source.width;
	let height = source.height;
	if (settings.mode === "percent" && positive(settings.percent)) {
		width = (source.width * settings.percent) / 100;
		height = (source.height * settings.percent) / 100;
	} else if (
		settings.mode === "longestSide" &&
		positive(settings.longestSide)
	) {
		const factor = settings.longestSide / Math.max(source.width, source.height);
		width = source.width * factor;
		height = source.height * factor;
	} else if (settings.mode === "dimensions") {
		const hasWidth = positive(settings.width);
		const hasHeight = positive(settings.height);
		if (settings.keepRatio && (hasWidth || hasHeight)) {
			// Fit inside the given box while keeping the source ratio.
			const factor = Math.min(
				hasWidth ? (settings.width as number) / source.width : Infinity,
				hasHeight ? (settings.height as number) / source.height : Infinity,
			);
			width = source.width * factor;
			height = source.height * factor;
		} else if (hasWidth || hasHeight) {
			width = hasWidth ? (settings.width as number) : source.width;
			height = hasHeight ? (settings.height as number) : source.height;
		}
	}
	if (
		!settings.allowUpscale &&
		settings.mode === "dimensions" &&
		!settings.keepRatio
	) {
		// Stretching sets each side on its own, so limit each side on its own.
		width = Math.min(width, source.width);
		height = Math.min(height, source.height);
	} else if (!settings.allowUpscale) {
		const factor = Math.max(width / source.width, height / source.height);
		if (factor > 1) {
			width /= factor;
			height /= factor;
		}
	}
	return { width: toPixels(width), height: toPixels(height) };
}

export function formatBytes(bytes: number, locale: string): string {
	const units = ["B", "KB", "MB", "GB"];
	let value = bytes;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}
	const digits = unit === 0 ? 0 : value < 10 ? 2 : value < 100 ? 1 : 0;
	return `${value.toLocaleString(locale, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	})} ${units[unit]}`;
}

/** Positive when the output is smaller, negative when it grew. */
export function savingsPercent(before: number, after: number): number {
	if (before <= 0) return 0;
	return Math.round((1 - after / before) * 100);
}
