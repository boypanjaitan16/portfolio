import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { ascii, buildTiff, segment } from "./metadataFixtures";

let createBitmap: ReturnType<typeof vi.fn>;
let encoded: {
	width: number;
	height: number;
	type?: string;
	quality?: number;
}[];
let encodedType: string | null;
let downloads: string[];

function withBytes<T extends Blob>(blob: T, bytes: number[]): T {
	Object.defineProperty(blob, "arrayBuffer", {
		value: async () => Uint8Array.from(bytes).buffer,
	});
	return blob;
}

const gpsJpeg = [
	0xff,
	0xd8,
	...segment(0xe1, [
		...ascii("Exif\0\0"),
		...buildTiff([
			[
				{ tag: 0x010f, ascii: "Pixel" },
				{ tag: 0x8825, ifd: 1 },
			],
			[
				{ tag: 1, ascii: "N" },
				{
					tag: 2,
					rationals: [
						[1, 1],
						[30, 1],
						[0, 1],
					],
				},
				{ tag: 3, ascii: "E" },
				{
					tag: 4,
					rationals: [
						[103, 1],
						[0, 1],
						[0, 1],
					],
				},
			],
		]),
	]),
	0xff,
	0xda,
];

function photo(name = "photo.jpg", type = "image/jpeg", bytes = gpsJpeg) {
	return withBytes(new File(["image"], name, { type }), bytes);
}

beforeEach(() => {
	window.localStorage.clear();
	encoded = [];
	encodedType = null;
	downloads = [];
	createBitmap = vi
		.fn()
		.mockResolvedValue({ width: 400, height: 200, close: vi.fn() });
	vi.stubGlobal("createImageBitmap", createBitmap);
	const context = {
		setTransform: vi.fn(),
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		translate: vi.fn(),
		scale: vi.fn(),
		rotate: vi.fn(),
		drawImage: vi.fn(),
	} as unknown as CanvasRenderingContext2D;
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
	vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
		this: HTMLCanvasElement,
		callback,
		type,
		quality,
	) {
		encoded.push({ width: this.width, height: this.height, type, quality });
		callback(withBytes(new Blob(["x"], { type: encodedType ?? type }), []));
	});
	vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:image");
	vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
		this: HTMLAnchorElement,
	) {
		downloads.push(this.download);
	});
});

afterEach(() => {
	// Unmount before restoring canvas mocks so no late preview draw hits jsdom.
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function renderEditor() {
	render(
		<MemoryRouter initialEntries={["/image-editor"]}>
			<App />
		</MemoryRouter>,
	);
}

async function upload(file: File) {
	fireEvent.change(screen.getByLabelText("Choose image"), {
		target: { files: [file] },
	});
	await screen.findByText("Output: 400 × 200 px");
}

function cropInput(name: string) {
	return screen.getByRole("spinbutton", { name }) as HTMLInputElement;
}

it("rejects unsupported files and disables editing until an image loads", () => {
	renderEditor();
	expect(
		screen.getByRole("heading", { name: "Image Editor & EXIF Remover" }),
	).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Rotate right" })).toBeDisabled();
	fireEvent.change(screen.getByLabelText("Choose image"), {
		target: { files: [new File(["gif"], "a.gif", { type: "image/gif" })] },
	});
	expect(screen.getByRole("alert")).toHaveTextContent(
		"Choose a PNG, JPEG, or WebP image.",
	);
	expect(createBitmap).not.toHaveBeenCalled();
});

it("rejects images over the pixel limit", async () => {
	createBitmap.mockResolvedValueOnce({
		width: 10_000,
		height: 6_000,
		close: vi.fn(),
	});
	renderEditor();
	fireEvent.change(screen.getByLabelText("Choose image"), {
		target: { files: [photo()] },
	});
	expect(await screen.findByRole("alert")).toHaveTextContent(
		"This image is too large.",
	);
});

it("loads an upright image and summarizes its metadata, including GPS", async () => {
	renderEditor();
	await upload(photo());
	expect(createBitmap).toHaveBeenCalledWith(expect.any(File), {
		imageOrientation: "from-image",
	});
	expect(screen.getByText("photo.jpg · 400 × 200 px")).toBeInTheDocument();
	expect(
		await screen.findByText(
			"This image contains the location where it was taken.",
		),
	).toBeInTheDocument();
	expect(screen.getByText("Pixel")).toBeInTheDocument();
	expect(screen.getByText("1.50000, 103.00000")).toBeInTheDocument();
	expect(screen.getByText("EXIF, GPS")).toBeInTheDocument();
	expect(screen.getByRole("combobox", { name: "Format" })).toHaveValue(
		"image/jpeg",
	);
});

it("reports when a file has no metadata", async () => {
	renderEditor();
	await upload(photo("clean.png", "image/png", [0xff, 0xd8, 0xff, 0xda]));
	expect(
		await screen.findByText("No metadata detected in this file."),
	).toBeInTheDocument();
});

it("rotates, flips, straightens, and crops with presets and numeric fields", async () => {
	renderEditor();
	await upload(photo());
	fireEvent.click(screen.getByRole("button", { name: "Rotate right" }));
	expect(screen.getByText("Output: 200 × 400 px")).toBeInTheDocument();
	fireEvent.click(screen.getByRole("button", { name: "Flip horizontal" }));
	expect(
		screen.getByRole("button", { name: "Flip horizontal" }),
	).toHaveAttribute("aria-pressed", "true");
	fireEvent.click(screen.getByRole("button", { name: "Reset rotation" }));
	expect(screen.getByText("Output: 400 × 200 px")).toBeInTheDocument();

	fireEvent.change(screen.getByRole("slider", { name: "Straighten" }), {
		target: { value: "10" },
	});
	expect(cropInput("Angle (degrees)")).toHaveValue(10);
	expect(Number(cropInput("Width").value)).toBeLessThan(400);
	fireEvent.click(screen.getByRole("button", { name: "Reset rotation" }));

	fireEvent.click(screen.getByRole("button", { name: "1:1" }));
	expect(screen.getByText("Output: 200 × 200 px")).toBeInTheDocument();
	expect(cropInput("X")).toHaveValue(100);
	fireEvent.change(cropInput("Width"), { target: { value: "100" } });
	expect(cropInput("Height")).toHaveValue(100);

	const area = screen.getByRole("button", { name: "Crop area" });
	fireEvent.keyDown(area, { key: "ArrowRight", shiftKey: true });
	fireEvent.keyDown(area, { key: "ArrowDown" });
	expect(cropInput("X")).toHaveValue(110);
	expect(cropInput("Y")).toHaveValue(1);

	fireEvent.click(screen.getByRole("button", { name: "Reset crop" }));
	expect(screen.getByText("Output: 200 × 200 px")).toBeInTheDocument();
});

it("downloads a re-encoded crop and confirms the new file has no metadata", async () => {
	renderEditor();
	await upload(photo());
	fireEvent.click(screen.getByRole("button", { name: "16:9" }));
	fireEvent.click(screen.getByRole("button", { name: "Download image" }));
	expect(
		await screen.findByText(
			"Downloaded photo-edited.jpg. No metadata was found in the new file.",
		),
	).toBeInTheDocument();
	expect(encoded.at(-1)).toEqual({
		width: 356,
		height: 200,
		type: "image/jpeg",
		quality: 0.92,
	});
	expect(downloads).toEqual(["photo-edited.jpg"]);

	fireEvent.change(screen.getByRole("combobox", { name: "Format" }), {
		target: { value: "image/png" },
	});
	expect(
		screen.queryByRole("slider", { name: /Quality/ }),
	).not.toBeInTheDocument();
});

it("shows an error when the browser cannot encode the chosen format", async () => {
	renderEditor();
	await upload(photo());
	fireEvent.change(screen.getByRole("combobox", { name: "Format" }), {
		target: { value: "image/webp" },
	});
	encodedType = "image/png";
	fireEvent.click(screen.getByRole("button", { name: "Download image" }));
	expect(await screen.findByRole("alert")).toHaveTextContent(
		"This browser cannot create that format.",
	);
	expect(downloads).toEqual([]);
});

it("uses Indonesian copy with the saved locale", async () => {
	window.localStorage.setItem("portfolio-locale", "id");
	renderEditor();
	expect(
		screen.getByRole("heading", { name: "Editor Gambar & Penghapus EXIF" }),
	).toBeInTheDocument();
	fireEvent.change(screen.getByLabelText("Pilih gambar"), {
		target: { files: [photo()] },
	});
	expect(
		await screen.findByText("Gambar ini berisi lokasi tempat gambar diambil."),
	).toBeInTheDocument();
	await waitFor(() =>
		expect(screen.getByText("Hasil: 400 × 200 px")).toBeInTheDocument(),
	);
});
