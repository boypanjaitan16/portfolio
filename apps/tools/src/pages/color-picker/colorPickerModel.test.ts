import {
	colorHex,
	colorRgb,
	imagePointFromClient,
	opacityPercent,
} from "./colorPickerModel";

it("samples the exact source pixel from a scaled image and clamps its edges", () => {
	const rect = { left: 10, top: 20, width: 200, height: 100 };
	expect(imagePointFromClient(10, 20, rect, 4, 2)).toEqual({ x: 0, y: 0 });
	expect(imagePointFromClient(159, 94, rect, 4, 2)).toEqual({ x: 2, y: 1 });
	expect(imagePointFromClient(210, 120, rect, 4, 2)).toEqual({ x: 3, y: 1 });
	expect(imagePointFromClient(-20, -20, rect, 4, 2)).toEqual({ x: 0, y: 0 });
	expect(imagePointFromClient(10, 20, rect, 0, 2)).toBeNull();
});

it("formats HEX, RGB, and alpha from one decoded pixel", () => {
	const pixel = { x: 0, y: 0, r: 15, g: 160, b: 255, a: 128 };
	expect(colorHex(pixel)).toBe("#0FA0FF");
	expect(colorRgb(pixel)).toBe("rgb(15, 160, 255)");
	expect(opacityPercent(pixel)).toBe("50.2%");
	expect(opacityPercent({ ...pixel, a: 1 })).toBe("0.4%");
});
