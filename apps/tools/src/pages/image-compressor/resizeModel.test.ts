import {
	defaultResize,
	formatBytes,
	type ResizeSettings,
	savingsPercent,
	targetSize,
} from "./resizeModel";

const photo = { width: 4000, height: 3000 };

function resize(overrides: Partial<ResizeSettings>): ResizeSettings {
	return { ...defaultResize, ...overrides };
}

it("keeps the size when resizing is off", () => {
	expect(targetSize(photo, defaultResize)).toEqual(photo);
});

it("scales by percentage and caps enlargement unless allowed", () => {
	expect(targetSize(photo, resize({ mode: "percent", percent: 25 }))).toEqual({
		width: 1000,
		height: 750,
	});
	expect(targetSize(photo, resize({ mode: "percent", percent: 150 }))).toEqual(
		photo,
	);
	expect(
		targetSize(
			{ width: 10, height: 5 },
			resize({ mode: "percent", percent: 150, allowUpscale: true }),
		),
	).toEqual({ width: 15, height: 8 });
});

it("limits the longest side for landscape and portrait images", () => {
	const settings = resize({ mode: "longestSide", longestSide: 1000 });
	expect(targetSize(photo, settings)).toEqual({ width: 1000, height: 750 });
	expect(targetSize({ width: 3000, height: 4000 }, settings)).toEqual({
		width: 750,
		height: 1000,
	});
	expect(targetSize({ width: 800, height: 600 }, settings)).toEqual({
		width: 800,
		height: 600,
	});
});

it("fits inside width and height while keeping the ratio", () => {
	expect(
		targetSize(
			photo,
			resize({ mode: "dimensions", width: 1000, height: null }),
		),
	).toEqual({ width: 1000, height: 750 });
	expect(
		targetSize(photo, resize({ mode: "dimensions", width: null, height: 300 })),
	).toEqual({ width: 400, height: 300 });
	expect(
		targetSize(photo, resize({ mode: "dimensions", width: 1000, height: 300 })),
	).toEqual({ width: 400, height: 300 });
	expect(
		targetSize(
			photo,
			resize({ mode: "dimensions", width: null, height: null }),
		),
	).toEqual(photo);
});

it("stretches to exact sides without the ratio, limiting each side", () => {
	const settings = resize({
		mode: "dimensions",
		keepRatio: false,
		width: 500,
		height: 5000,
	});
	expect(targetSize(photo, settings)).toEqual({ width: 500, height: 3000 });
	expect(targetSize(photo, { ...settings, allowUpscale: true })).toEqual({
		width: 500,
		height: 5000,
	});
	expect(targetSize(photo, { ...settings, width: null, height: 100 })).toEqual({
		width: 4000,
		height: 100,
	});
});

it("never returns a dimension below one pixel", () => {
	expect(
		targetSize(
			{ width: 1000, height: 2 },
			resize({ mode: "percent", percent: 1 }),
		),
	).toEqual({ width: 10, height: 1 });
});

it("formats byte sizes and savings", () => {
	expect(formatBytes(512, "en")).toBe("512 B");
	expect(formatBytes(1536, "en")).toBe("1.50 KB");
	expect(formatBytes(25.5 * 1024 * 1024, "id")).toBe("25,5 MB");
	expect(savingsPercent(1000, 250)).toBe(75);
	expect(savingsPercent(1000, 1200)).toBe(-20);
	expect(savingsPercent(0, 10)).toBe(0);
});
