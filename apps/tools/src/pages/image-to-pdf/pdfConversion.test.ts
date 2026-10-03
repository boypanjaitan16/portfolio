import { PDFDocument } from "pdf-lib";
import {
	type ConversionError,
	imagesToPdf,
	inspectImage,
	pageLayout,
} from "./pdfConversion";

const pngBytes = Uint8Array.from(
	Buffer.from(
		"iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAHElEQVR4AYTIoREAAACCQI/9d9asRWiP3KPpQwAAAP//yH46pQAAAAZJREFUAwDXzwgBKMyBrQAAAABJRU5ErkJggg==",
		"base64",
	),
);
const jpegBytes = Uint8Array.from(
	Buffer.from(
		"/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AIyAD//Z",
		"base64",
	),
);

function file(name: string, type = "image/png") {
	return new File([pngBytes], name, { type });
}

function bitmap(width: number, height: number) {
	return { width, height, close: vi.fn() } as unknown as ImageBitmap;
}

beforeEach(() => {
	vi.stubGlobal(
		"createImageBitmap",
		vi.fn().mockResolvedValue(bitmap(1000, 2000)),
	);
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
		drawImage: vi.fn(),
	} as unknown as CanvasRenderingContext2D);
	vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
		(callback, type) => {
			const bytes = type === "image/jpeg" ? jpegBytes : pngBytes;
			const blob = new Blob([bytes], { type });
			Object.defineProperty(blob, "arrayBuffer", {
				value: async () => bytes.buffer,
			});
			callback(blob);
		},
	);
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

it("places complete images on auto-oriented A4 and Letter pages", () => {
	for (const size of ["a4", "letter"] as const) {
		for (const image of [
			{ width: 1000, height: 2000 },
			{ width: 2000, height: 1000 },
		]) {
			const layout = pageLayout(image, size);
			expect(layout.width > layout.height).toBe(image.width > image.height);
			expect(layout.imageWidth / layout.imageHeight).toBeCloseTo(
				image.width / image.height,
			);
			expect(layout.x).toBeGreaterThanOrEqual(28);
			expect(layout.y).toBeGreaterThanOrEqual(28);
			expect(layout.x + layout.imageWidth).toBeLessThanOrEqual(
				layout.width - 28,
			);
			expect(layout.y + layout.imageHeight).toBeLessThanOrEqual(
				layout.height - 28,
			);
		}
	}
});

it("matches each image's ratio on an A4-length page", () => {
	const layout = pageLayout({ width: 3000, height: 2000 }, "image");
	expect(layout.width).toBeCloseTo(841.89);
	expect(layout.height).toBeCloseTo((841.89 * 2) / 3);
	expect(layout.x).toBeCloseTo(0);
	expect(layout.y).toBeCloseTo(0);
});

it("rejects invalid or oversized images before adding them", async () => {
	await expect(
		inspectImage(file("wrong.gif", "image/gif")),
	).rejects.toMatchObject({
		code: "unsupported",
	});
	vi.mocked(createImageBitmap).mockRejectedValueOnce(new Error("decode"));
	await expect(inspectImage(file("broken.png"))).rejects.toMatchObject({
		code: "invalidImage",
	});
	const tooWide = bitmap(16_385, 100);
	vi.mocked(createImageBitmap).mockResolvedValueOnce(tooWide);
	await expect(inspectImage(file("wide.png"))).rejects.toMatchObject({
		code: "imageTooLarge",
	});
	expect(tooWide.close).toHaveBeenCalled();
	const tooManyPixels = bitmap(10_000, 6000);
	vi.mocked(createImageBitmap).mockResolvedValueOnce(tooManyPixels);
	await expect(inspectImage(file("large.png"))).rejects.toMatchObject({
		code: "imageTooLarge",
	});
});

it("creates pages in input order and converts WebP to an embedded PNG", async () => {
	vi.mocked(createImageBitmap)
		.mockResolvedValueOnce(bitmap(2000, 1000))
		.mockResolvedValueOnce(bitmap(1000, 2000));
	const files = [file("wide.webp", "image/webp"), file("tall.png")];
	const bytes = await imagesToPdf(files, "a4");
	const pdf = await PDFDocument.load(bytes);
	expect(pdf.getPageCount()).toBe(2);
	expect(pdf.getPage(0).getWidth()).toBeGreaterThan(pdf.getPage(0).getHeight());
	expect(pdf.getPage(1).getHeight()).toBeGreaterThan(pdf.getPage(1).getWidth());
	expect(
		vi.mocked(createImageBitmap).mock.calls.map(([input]) => input),
	).toEqual(files);
	expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
		expect.any(Function),
		"image/png",
		undefined,
	);
});

it("embeds JPEG output and accepts files whose type comes from the extension", async () => {
	const bytes = await imagesToPdf([file("photo.jpeg", "")], "letter");
	const pdf = await PDFDocument.load(bytes);
	expect(pdf.getPageCount()).toBe(1);
	expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
		expect.any(Function),
		"image/jpeg",
		0.92,
	);
});

it("caps embedded resolution at 300 DPI and stops on a failed image", async () => {
	vi.mocked(createImageBitmap).mockResolvedValueOnce(bitmap(6000, 4000));
	await imagesToPdf([file("large.png")], "a4");
	const canvas = vi.mocked(HTMLCanvasElement.prototype.getContext).mock
		.instances[0] as HTMLCanvasElement;
	expect(canvas.width).toBeLessThan(3508);
	expect(canvas.height).toBeLessThan(2481);
	vi.mocked(createImageBitmap).mockResolvedValueOnce(bitmap(1000, 1000));
	vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementationOnce(
		(callback) => callback(null),
	);
	await expect(imagesToPdf([file("broken.png")], "a4")).rejects.toEqual(
		expect.objectContaining<Partial<ConversionError>>({
			code: "createFailed",
			fileName: "broken.png",
		}),
	);
});
