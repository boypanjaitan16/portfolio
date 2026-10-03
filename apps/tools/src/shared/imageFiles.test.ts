import {
	acceptsImage,
	canvasToBlob,
	ExportError,
	formatForFile,
	outputFileName,
} from "./imageFiles";

afterEach(() => vi.restoreAllMocks());

it("accepts PNG, JPEG, and WebP by type or extension", () => {
	expect(acceptsImage({ type: "image/webp", name: "a" })).toBe(true);
	expect(acceptsImage({ type: "image/gif", name: "a.png" })).toBe(false);
	expect(acceptsImage({ type: "", name: "scan.JPG" })).toBe(true);
	expect(acceptsImage({ type: "", name: "scan.heic" })).toBe(false);
});

it("chooses the default format and an output name", () => {
	expect(formatForFile({ type: "image/webp", name: "a" })).toBe("image/webp");
	expect(formatForFile({ type: "", name: "photo.JPEG" })).toBe("image/jpeg");
	expect(formatForFile({ type: "", name: "scan" })).toBe("image/png");
	expect(outputFileName("holiday.photo.jpeg", "edited", "image/jpeg")).toBe(
		"holiday.photo-edited.jpg",
	);
	expect(outputFileName(".png", "compressed", "image/webp")).toBe(
		"image-compressed.webp",
	);
});

it("encodes with quality, releases the canvas, and detects fallbacks", async () => {
	let type = "image/webp";
	const toBlob = vi
		.spyOn(HTMLCanvasElement.prototype, "toBlob")
		.mockImplementation((callback) => callback(new Blob(["x"], { type })));
	const canvas = document.createElement("canvas");
	canvas.width = 20;
	await canvasToBlob(canvas, "image/webp", 75, { release: false });
	expect(toBlob).toHaveBeenLastCalledWith(
		expect.any(Function),
		"image/webp",
		0.75,
	);
	expect(canvas.width).toBe(20);
	await canvasToBlob(canvas, "image/webp", 75);
	expect(canvas.width).toBe(0);
	type = "image/png";
	await expect(canvasToBlob(canvas, "image/webp", 75)).rejects.toEqual(
		new ExportError("formatUnsupported"),
	);
	toBlob.mockImplementation((callback) => callback(null));
	await expect(canvasToBlob(canvas, "image/png", 75)).rejects.toEqual(
		new ExportError("exportFailed"),
	);
});
