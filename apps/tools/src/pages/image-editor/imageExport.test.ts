import { ExportError } from "../../shared/imageFiles";
import { exportImage } from "./imageExport";
import { identityTransform } from "./imageTransformModel";

let context: Record<string, unknown>;
let encodedType: string | null;
let toBlobArgs: unknown[];

beforeEach(() => {
	encodedType = null;
	toBlobArgs = [];
	context = {
		fillRect: vi.fn(),
		translate: vi.fn(),
		scale: vi.fn(),
		rotate: vi.fn(),
		drawImage: vi.fn(),
	};
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
		context as unknown as CanvasRenderingContext2D,
	);
	vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
		this: HTMLCanvasElement,
		callback,
		type,
		quality,
	) {
		toBlobArgs = [this.width, this.height, type, quality];
		callback(new Blob(["x"], { type: encodedType ?? type }));
	});
});

afterEach(() => vi.restoreAllMocks());

const source = { width: 40, height: 20 };
const crop = { x: 5, y: 2, width: 30, height: 10 };

it("encodes the crop size with quality for lossy formats only", async () => {
	const jpeg = await exportImage(
		{} as CanvasImageSource,
		source,
		identityTransform,
		crop,
		"image/jpeg",
		80,
	);
	expect(jpeg.type).toBe("image/jpeg");
	expect(toBlobArgs).toEqual([30, 10, "image/jpeg", 0.8]);
	expect(context.fillStyle).toBe("#ffffff");
	expect(context.fillRect).toHaveBeenCalledWith(0, 0, 30, 10);
	expect(context.drawImage).toHaveBeenCalledWith({}, -20, -10);

	vi.mocked(context.fillRect as () => void).mockClear();
	await exportImage(
		{} as CanvasImageSource,
		source,
		identityTransform,
		crop,
		"image/png",
		80,
	);
	expect(toBlobArgs).toEqual([30, 10, "image/png", undefined]);
	expect(context.fillRect).not.toHaveBeenCalled();
});

it("rejects when the browser falls back to another format", async () => {
	encodedType = "image/png";
	await expect(
		exportImage(
			{} as CanvasImageSource,
			source,
			identityTransform,
			crop,
			"image/webp",
			92,
		),
	).rejects.toEqual(new ExportError("formatUnsupported"));
});
