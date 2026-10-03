import {
	aspectRatio,
	clampCrop,
	defaultCrop,
	drawTransformed,
	fitAspect,
	flipCrop,
	identityTransform,
	largestInscribedRect,
	moveCrop,
	resizeCrop,
	rotateVisually,
	setCropField,
	type Transform,
	transformedSize,
	visualAngle,
	withVisualAngle,
} from "./imageTransformModel";

const landscape = { width: 400, height: 200 };

function transform(overrides: Partial<Transform>): Transform {
	return { ...identityTransform, ...overrides };
}

describe("transformedSize", () => {
	it("keeps or swaps dimensions for quarter turns without rounding noise", () => {
		expect(transformedSize(landscape, identityTransform)).toEqual(landscape);
		expect(transformedSize(landscape, transform({ quarterTurns: 1 }))).toEqual({
			width: 200,
			height: 400,
		});
		expect(transformedSize(landscape, transform({ quarterTurns: 2 }))).toEqual(
			landscape,
		);
	});

	it("grows to the bounding box of a straightened image", () => {
		const size = transformedSize(
			{ width: 100, height: 100 },
			transform({ angle: 45 }),
		);
		expect(size).toEqual({ width: 141, height: 141 });
	});
});

describe("visual rotation", () => {
	it("turns clockwise and wraps around", () => {
		expect(rotateVisually(identityTransform, 1).quarterTurns).toBe(1);
		expect(rotateVisually(identityTransform, -1).quarterTurns).toBe(3);
	});

	it("reverses the stored direction when one axis is mirrored", () => {
		const mirrored = transform({ flipX: true });
		expect(rotateVisually(mirrored, 1).quarterTurns).toBe(3);
		const both = transform({ flipX: true, flipY: true });
		expect(rotateVisually(both, 1).quarterTurns).toBe(1);
	});

	it("shows and sets the angle as seen on screen, clamped to the range", () => {
		const mirrored = transform({ flipY: true, angle: 10 });
		expect(visualAngle(mirrored)).toBe(-10);
		expect(withVisualAngle(mirrored, 5).angle).toBe(-5);
		expect(withVisualAngle(identityTransform, 90).angle).toBe(45);
		expect(withVisualAngle(identityTransform, Number.NaN).angle).toBe(0);
	});
});

describe("largestInscribedRect", () => {
	it("covers the whole image without straightening", () => {
		expect(largestInscribedRect(landscape, identityTransform)).toEqual({
			x: 0,
			y: 0,
			...landscape,
		});
	});

	it("stays inside the rotated image and is centered in the bounds", () => {
		const t = transform({ angle: 10 });
		const rect = largestInscribedRect(landscape, t);
		const bounds = transformedSize(landscape, t);
		expect(rect.width).toBeLessThan(400);
		expect(rect.height).toBeLessThan(200);
		expect(rect.x * 2 + rect.width).toBeCloseTo(bounds.width, -0.5);
		expect(rect.y * 2 + rect.height).toBeCloseTo(bounds.height, -0.5);
		// Every corner of the crop must map back inside the source image.
		const radians = (-10 * Math.PI) / 180;
		for (const [cx, cy] of [
			[rect.x, rect.y],
			[rect.x + rect.width, rect.y],
			[rect.x, rect.y + rect.height],
			[rect.x + rect.width, rect.y + rect.height],
		]) {
			const dx = cx - bounds.width / 2;
			const dy = cy - bounds.height / 2;
			const sx = dx * Math.cos(radians) - dy * Math.sin(radians);
			const sy = dx * Math.sin(radians) + dy * Math.cos(radians);
			expect(Math.abs(sx)).toBeLessThanOrEqual(200.5);
			expect(Math.abs(sy)).toBeLessThanOrEqual(100.5);
		}
	});
});

describe("aspect ratios", () => {
	it("orients presets like the turned image", () => {
		expect(aspectRatio("free", landscape, identityTransform)).toBeNull();
		expect(aspectRatio("original", landscape, identityTransform)).toBe(2);
		expect(aspectRatio("16:9", landscape, identityTransform)).toBeCloseTo(
			16 / 9,
		);
		expect(
			aspectRatio("4:3", landscape, transform({ quarterTurns: 1 })),
		).toBeCloseTo(3 / 4);
	});

	it("fits the largest centered rectangle with the ratio", () => {
		expect(fitAspect({ x: 0, y: 0, width: 400, height: 200 }, 1)).toEqual({
			x: 100,
			y: 0,
			width: 200,
			height: 200,
		});
		expect(defaultCrop(landscape, identityTransform, "1:1")).toEqual({
			x: 100,
			y: 0,
			width: 200,
			height: 200,
		});
	});
});

describe("crop editing", () => {
	const bounds = landscape;
	const start = { x: 100, y: 50, width: 100, height: 100 };

	it("moves within the bounds", () => {
		expect(moveCrop(start, 500, -500, bounds)).toEqual({
			x: 300,
			y: 0,
			width: 100,
			height: 100,
		});
	});

	it("clamps size and position", () => {
		expect(
			clampCrop({ x: -10, y: 250, width: 900, height: 0.2 }, bounds),
		).toEqual({ x: 0, y: 199, width: 400, height: 1 });
	});

	it("resizes freely from an edge or corner", () => {
		expect(resizeCrop(start, "e", 50, 0, bounds, null)).toEqual({
			...start,
			width: 150,
		});
		expect(resizeCrop(start, "nw", -20, -60, bounds, null)).toEqual({
			x: 80,
			y: 0,
			width: 120,
			height: 150,
		});
		expect(resizeCrop(start, "w", 500, 0, bounds, null).width).toBe(1);
	});

	it("keeps the ratio and the opposite corner when resizing with a ratio", () => {
		const result = resizeCrop(start, "se", 40, 10, bounds, 1);
		expect(result).toEqual({ x: 100, y: 50, width: 140, height: 140 });
		const limited = resizeCrop(start, "se", 300, 0, bounds, 1);
		expect(limited).toEqual({ x: 100, y: 50, width: 150, height: 150 });
	});

	it("centers the other dimension when resizing an edge with a ratio", () => {
		expect(resizeCrop(start, "e", 20, 0, bounds, 1)).toEqual({
			x: 100,
			y: 40,
			width: 120,
			height: 120,
		});
	});

	it("applies numeric edits and keeps the ratio", () => {
		expect(setCropField(start, "width", 160, bounds, 2)).toEqual({
			x: 100,
			y: 50,
			width: 160,
			height: 80,
		});
		expect(setCropField(start, "x", 999, bounds, null).x).toBe(300);
		expect(setCropField(start, "y", Number.NaN, bounds, null)).toBe(start);
	});

	it("mirrors the crop with a flip", () => {
		expect(flipCrop(start, "x", bounds)).toEqual({ ...start, x: 200 });
		expect(flipCrop(start, "y", bounds)).toEqual({ ...start, y: 50 });
	});
});

it("draws flips in screen space before rotating around the center", () => {
	const calls: unknown[][] = [];
	const context = {
		translate: (...args: number[]) => calls.push(["translate", ...args]),
		scale: (...args: number[]) => calls.push(["scale", ...args]),
		rotate: (...args: number[]) => calls.push(["rotate", ...args]),
		drawImage: (_image: unknown, ...args: number[]) =>
			calls.push(["drawImage", ...args]),
	};
	drawTransformed(
		context as unknown as CanvasRenderingContext2D,
		{} as CanvasImageSource,
		landscape,
		transform({ quarterTurns: 1, flipX: true }),
		{ x: 10, y: 20 },
	);
	expect(calls).toEqual([
		["translate", -10, -20],
		["translate", 100, 200],
		["scale", -1, 1],
		["rotate", Math.PI / 2],
		["drawImage", -200, -100],
	]);
});
