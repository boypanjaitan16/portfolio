import { LogoError, loadQrLogo } from "./qrLogo";

let context: CanvasRenderingContext2D;
let invalidImage = false;

class TestImage {
	naturalWidth = 2048;
	naturalHeight = 1024;
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;

	set src(_value: string) {
		queueMicrotask(() => {
			if (invalidImage) this.onerror?.();
			else this.onload?.();
		});
	}
}

beforeEach(() => {
	invalidImage = false;
	context = { drawImage: vi.fn() } as unknown as CanvasRenderingContext2D;
	vi.stubGlobal("Image", TestImage);
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
	vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
		"data:image/png;base64,cG5n",
	);
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

it.each(["image/png", "image/jpeg", "image/webp"])(
	"normalizes %s to a bounded embedded PNG without painting a background",
	async (type) => {
		const file = new File(["image"], "brand", { type });
		const logo = await loadQrLogo(file);
		expect(logo).toMatchObject({
			name: "brand",
			width: 1024,
			height: 512,
			dataUrl: "data:image/png;base64,cG5n",
		});
		expect(context.drawImage).toHaveBeenCalledTimes(1);
		expect(context.fillRect).toBeUndefined();
	},
);

it("rejects unsupported, oversized, and undecodable files", async () => {
	await expect(
		loadQrLogo(new File(["svg"], "logo.svg", { type: "image/svg+xml" })),
	).rejects.toMatchObject({ code: "unsupported" });
	const large = new File(["x"], "logo.png", { type: "image/png" });
	vi.spyOn(large, "size", "get").mockReturnValue(10 * 1024 * 1024 + 1);
	await expect(loadQrLogo(large)).rejects.toMatchObject({ code: "tooLarge" });
	invalidImage = true;
	await expect(
		loadQrLogo(new File(["broken"], "broken.png", { type: "image/png" })),
	).rejects.toEqual(new LogoError("decode"));
});
