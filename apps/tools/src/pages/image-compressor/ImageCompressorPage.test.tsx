import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";

type Encode = {
	width: number;
	height: number;
	type?: string;
	quality?: number;
};

let encodes: Encode[];
let encodedSize: number;
let encodedType: string | null;
let downloads: { name: string; blob: Blob }[];
let blobs: Map<string, Blob>;

function withBytes<T extends Blob>(blob: T): T {
	Object.defineProperty(blob, "arrayBuffer", {
		value: async () => new Uint8Array(blob.size).buffer,
	});
	return blob;
}

function image(name: string, type: string, bytes = 4000) {
	return new File([new Uint8Array(bytes)], name, { type });
}

beforeEach(() => {
	window.localStorage.clear();
	encodes = [];
	encodedSize = 1000;
	encodedType = null;
	downloads = [];
	blobs = new Map();
	vi.stubGlobal(
		"createImageBitmap",
		vi.fn().mockResolvedValue({ width: 1000, height: 500, close: vi.fn() }),
	);
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
		fillRect: vi.fn(),
		drawImage: vi.fn(),
	} as unknown as CanvasRenderingContext2D);
	vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
		this: HTMLCanvasElement,
		callback,
		type,
		quality,
	) {
		encodes.push({ width: this.width, height: this.height, type, quality });
		callback(
			withBytes(
				new Blob([new Uint8Array(encodedSize)], {
					type: encodedType ?? type,
				}),
			),
		);
	});
	let urls = 0;
	vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
		const url = `blob:${++urls}`;
		blobs.set(url, blob as Blob);
		return url;
	});
	vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
		this: HTMLAnchorElement,
	) {
		downloads.push({
			name: this.download,
			blob: blobs.get(this.href) as Blob,
		});
	});
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function renderCompressor() {
	render(
		<MemoryRouter initialEntries={["/image-compressor"]}>
			<App />
		</MemoryRouter>,
	);
}

function add(...files: File[]) {
	fireEvent.change(screen.getByLabelText("Choose images"), {
		target: { files },
	});
}

async function compress(count: number) {
	fireEvent.click(
		screen.getByRole("button", {
			name: count === 1 ? "Compress 1 image" : `Compress ${count} images`,
		}),
	);
	await screen.findByRole("button", {
		name: count === 1 ? "Compress 1 image" : `Compress ${count} images`,
	});
}

function row(name: string) {
	return screen.getByText(name).closest("li") as HTMLElement;
}

it("adds valid images and lists the skipped files", () => {
	renderCompressor();
	expect(
		screen.getByRole("heading", { name: "Image Compressor & Converter" }),
	).toBeInTheDocument();
	expect(
		screen.getByRole("button", { name: /Compress 0 images/ }),
	).toBeDisabled();
	const huge = image("huge.png", "image/png");
	Object.defineProperty(huge, "size", { value: 60 * 1024 * 1024 });
	add(
		image("a.jpg", "image/jpeg"),
		image("b.png", "image/png"),
		image("c.gif", "image/gif"),
		huge,
	);
	expect(screen.getByRole("alert")).toHaveTextContent(
		"Skipped c.gif, huge.png.",
	);
	expect(
		within(screen.getByRole("main")).getAllByRole("listitem"),
	).toHaveLength(2);
	expect(screen.getByText("2 of 30")).toBeInTheDocument();
	fireEvent.click(screen.getByRole("button", { name: "Remove b.png" }));
	expect(
		within(screen.getByRole("main")).getAllByRole("listitem"),
	).toHaveLength(1);
});

it("compresses every image, downloads each one, and zips them", async () => {
	renderCompressor();
	add(image("a.jpg", "image/jpeg"), image("a.jpeg", "image/jpeg"));
	await compress(2);
	expect(
		within(row("a.jpg")).getByText(
			/Result: 1000 × 500 px · 1,000 B · 75% smaller/,
		),
	).toBeInTheDocument();
	expect(encodes).toEqual([
		{ width: 1000, height: 500, type: "image/jpeg", quality: 0.92 },
		{ width: 1000, height: 500, type: "image/jpeg", quality: 0.92 },
	]);
	expect(
		screen.getByText("7.81 KB → 1.95 KB (75% smaller)"),
	).toBeInTheDocument();
	fireEvent.click(
		within(row("a.jpg")).getByRole("button", {
			name: "Download a-compressed.jpg",
		}),
	);
	expect(downloads.map((download) => download.name)).toEqual([
		"a-compressed.jpg",
	]);
	fireEvent.click(screen.getByRole("button", { name: "Download all (ZIP)" }));
	await screen.findByRole("button", { name: "Download all (ZIP)" });
	await vi.waitFor(() => expect(downloads).toHaveLength(2));
	const zip = downloads[1];
	expect(zip.name).toBe("compressed-images.zip");
	expect(zip.blob.type).toBe("application/zip");
	// Two stored 1,000-byte entries plus headers for two unique names.
	expect(zip.blob.size).toBeGreaterThan(2000);
});

it("converts to another format and resizes by the longest side", async () => {
	renderCompressor();
	add(image("logo.png", "image/png"));
	// Keeping a PNG as PNG is lossless, so quality does not apply.
	expect(
		screen.queryByRole("slider", { name: /Quality/ }),
	).not.toBeInTheDocument();
	expect(screen.getByText(/PNG is lossless/)).toBeInTheDocument();
	fireEvent.change(screen.getByRole("combobox", { name: "Output format" }), {
		target: { value: "image/webp" },
	});
	expect(screen.getByRole("slider", { name: /Quality/ })).toHaveValue("92");
	fireEvent.click(screen.getByRole("radio", { name: "Longest side" }));
	fireEvent.change(
		screen.getByRole("spinbutton", { name: "Longest side (px)" }),
		{
			target: { value: "200" },
		},
	);
	await compress(1);
	expect(encodes.at(-1)).toEqual({
		width: 200,
		height: 100,
		type: "image/webp",
		quality: 0.92,
	});
	expect(
		within(row("logo.png")).getByText(/Result: 200 × 100 px/),
	).toBeInTheDocument();
	fireEvent.click(
		within(row("logo.png")).getByRole("button", {
			name: "Download logo-compressed.webp",
		}),
	);
	expect(downloads[0].name).toBe("logo-compressed.webp");

	fireEvent.click(screen.getByRole("radio", { name: "Percentage" }));
	expect(
		screen.getByText("Settings changed. Compress again to apply them."),
	).toBeInTheDocument();
});

it("warns when the target size cannot be reached or the file grew", async () => {
	encodedSize = 500_000;
	renderCompressor();
	add(image("big.jpg", "image/jpeg"));
	fireEvent.click(screen.getByRole("checkbox", { name: "Limit file size" }));
	expect(
		screen.getByRole("spinbutton", { name: "Maximum size (KB)" }),
	).toHaveValue(200);
	await compress(1);
	const item = row("big.jpg");
	expect(
		within(item).getByText(
			"Could not reach 200 KB; this is the smallest result found.",
		),
	).toBeInTheDocument();
	expect(
		within(item).getByText(/larger than the original/),
	).toBeInTheDocument();
});

it("shows a per-image error when the browser cannot encode the format", async () => {
	encodedType = "image/png";
	renderCompressor();
	add(image("a.jpg", "image/jpeg"));
	fireEvent.change(screen.getByRole("combobox", { name: "Output format" }), {
		target: { value: "image/webp" },
	});
	await compress(1);
	expect(
		within(row("a.jpg")).getByText("This browser cannot create this format."),
	).toBeInTheDocument();
	expect(
		screen.queryByRole("button", { name: /Download a-compressed/ }),
	).not.toBeInTheDocument();
});

it("uses Indonesian copy with the saved locale", async () => {
	window.localStorage.setItem("portfolio-locale", "id");
	renderCompressor();
	expect(
		screen.getByRole("heading", { name: "Kompres & Konversi Gambar" }),
	).toBeInTheDocument();
	fireEvent.change(screen.getByLabelText("Pilih gambar"), {
		target: { files: [image("a.jpg", "image/jpeg")] },
	});
	fireEvent.click(screen.getByRole("button", { name: "Kompres 1 gambar" }));
	expect(
		await within(row("a.jpg")).findByText(/75% lebih kecil/),
	).toBeInTheDocument();
});
