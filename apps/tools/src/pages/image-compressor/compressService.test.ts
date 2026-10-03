import {
	type CompressSettings,
	compressImage,
	renderResized,
	resolveFormat,
} from "./compressService";
import { defaultResize } from "./resizeModel";

type Encode = {
	width: number;
	height: number;
	type?: string;
	quality?: number;
};

let encodes: Encode[];
let drawCalls: number[][];
/** Encoded byte size for a canvas and quality; defaults to a tiny file. */
let sizeFor: (encode: Encode) => number;
let encodedType: string | null;
let close: ReturnType<typeof vi.fn>;

beforeEach(() => {
	encodes = [];
	drawCalls = [];
	sizeFor = () => 10;
	encodedType = null;
	close = vi.fn();
	vi.stubGlobal(
		"createImageBitmap",
		vi.fn().mockResolvedValue({ width: 1000, height: 500, close }),
	);
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
		function (this: HTMLCanvasElement) {
			return {
				fillRect: vi.fn(),
				drawImage: (_image: unknown, ...args: number[]) => drawCalls.push(args),
			} as unknown as CanvasRenderingContext2D;
		} as unknown as HTMLCanvasElement["getContext"],
	);
	vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
		this: HTMLCanvasElement,
		callback,
		type,
		quality,
	) {
		const encode = { width: this.width, height: this.height, type, quality };
		encodes.push(encode);
		callback(
			new Blob([new Uint8Array(sizeFor(encode))], {
				type: encodedType ?? type,
			}),
		);
	});
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function settings(overrides: Partial<CompressSettings>): CompressSettings {
	return {
		format: "original",
		quality: 80,
		targetKb: null,
		resize: defaultResize,
		...overrides,
	};
}

const jpeg = new File(["x"], "photo.jpeg", { type: "image/jpeg" });

it("keeps or converts the format and names the output", async () => {
	expect(resolveFormat(jpeg, "original")).toBe("image/jpeg");
	expect(resolveFormat(jpeg, "image/webp")).toBe("image/webp");

	const kept = await compressImage(jpeg, settings({}));
	expect(kept).toMatchObject({
		name: "photo-compressed.jpg",
		format: "image/jpeg",
		width: 1000,
		height: 500,
		quality: 80,
		targetMissed: false,
	});
	expect(encodes).toEqual([
		{ width: 1000, height: 500, type: "image/jpeg", quality: 0.8 },
	]);

	const png = await compressImage(jpeg, settings({ format: "image/png" }));
	expect(png).toMatchObject({ name: "photo-compressed.png", quality: null });
	expect(encodes.at(-1)?.quality).toBeUndefined();
	expect(close).toHaveBeenCalledTimes(2);
});

it("resizes, halving in steps for large reductions", async () => {
	const result = await compressImage(
		jpeg,
		settings({
			resize: { ...defaultResize, mode: "longestSide", longestSide: 200 },
		}),
	);
	expect(result).toMatchObject({ width: 200, height: 100 });
	expect(drawCalls).toEqual([
		[0, 0, 500, 250],
		[0, 0, 250, 125],
		[0, 0, 200, 100],
	]);
});

it("returns the highest quality that fits the target size", async () => {
	sizeFor = ({ quality = 1 }) => Math.round(quality * 100) * 20;
	const result = await compressImage(
		jpeg,
		settings({ format: "image/webp", quality: 90, targetKb: 1 }),
	);
	// 1 KB = 1024 bytes; quality 51 encodes to 1020 bytes, 52 to 1040.
	expect(result).toMatchObject({
		quality: 51,
		width: 1000,
		targetMissed: false,
	});
	expect(result.blob.size).toBeLessThanOrEqual(1024);
	expect(encodes.length).toBeLessThanOrEqual(2 + 7);
});

it("shrinks dimensions when the lowest quality is still too large", async () => {
	sizeFor = ({ width }) => width * 2;
	const result = await compressImage(
		jpeg,
		settings({ format: "image/jpeg", targetKb: 1 }),
	);
	expect(result.targetMissed).toBe(false);
	expect(result.width).toBeLessThan(1000);
	expect(result.blob.size).toBeLessThanOrEqual(1024);
});

it("reports a missed target with the smallest attempt", async () => {
	sizeFor = () => 50_000;
	const result = await compressImage(
		jpeg,
		settings({ format: "image/jpeg", targetKb: 1 }),
	);
	expect(result.targetMissed).toBe(true);
	expect(result.quality).toBe(10);
});

it("ignores the target size for PNG", async () => {
	sizeFor = () => 50_000;
	const result = await compressImage(
		jpeg,
		settings({ format: "image/png", targetKb: 1 }),
	);
	expect(result.targetMissed).toBe(false);
	expect(encodes).toHaveLength(1);
});

it("maps decode, size, and encoder failures to error codes", async () => {
	vi.mocked(createImageBitmap).mockRejectedValueOnce(new Error("decode"));
	await expect(compressImage(jpeg, settings({}))).rejects.toMatchObject({
		code: "invalidImage",
	});
	vi.mocked(createImageBitmap).mockResolvedValueOnce({
		width: 10_000,
		height: 10_000,
		close,
	} as unknown as ImageBitmap);
	await expect(compressImage(jpeg, settings({}))).rejects.toMatchObject({
		code: "tooLarge",
	});
	encodedType = "image/png";
	await expect(
		compressImage(jpeg, settings({ format: "image/webp" })),
	).rejects.toMatchObject({ code: "formatUnsupported" });
});

it("fills JPEG backgrounds white", () => {
	const fillRect = vi.fn();
	const context = { fillRect, drawImage: vi.fn() } as Record<string, unknown>;
	vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(
		context as unknown as CanvasRenderingContext2D,
	);
	renderResized(
		{} as CanvasImageSource,
		{ width: 10, height: 10 },
		{ width: 10, height: 10 },
		"image/jpeg",
	);
	expect(context.fillStyle).toBe("#ffffff");
	expect(fillRect).toHaveBeenCalledWith(0, 0, 10, 10);
});
