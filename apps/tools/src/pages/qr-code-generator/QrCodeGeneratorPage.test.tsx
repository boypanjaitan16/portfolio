import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import type { QrLogo } from "./qrCodeModel";
import { LogoError, loadQrLogo } from "./qrLogo";

vi.mock("./qrLogo", async (importOriginal) => ({
	...(await importOriginal<typeof import("./qrLogo")>()),
	loadQrLogo: vi.fn(),
}));

let blobs: Blob[];
let downloads: string[];
let pngDimensions: Array<[number, number]>;
let context: CanvasRenderingContext2D;

function fakeLogo(name = "logo.png"): QrLogo {
	const canvas = document.createElement("canvas");
	canvas.width = 200;
	canvas.height = 100;
	return {
		canvas,
		dataUrl: "data:image/png;base64,cG5n",
		name,
		width: 200,
		height: 100,
	};
}

beforeEach(() => {
	window.localStorage.clear();
	blobs = [];
	downloads = [];
	pngDimensions = [];
	context = {
		fillRect: vi.fn(),
		beginPath: vi.fn(),
		arc: vi.fn(),
		roundRect: vi.fn(),
		fill: vi.fn(),
		drawImage: vi.fn(),
	} as unknown as CanvasRenderingContext2D;
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
	vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
		this: HTMLCanvasElement,
		callback,
	) {
		pngDimensions.push([this.width, this.height]);
		callback(new Blob(["png"], { type: "image/png" }));
	});
	vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
		blobs.push(blob as Blob);
		return `blob:qr-${blobs.length}`;
	});
	vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
		this: HTMLAnchorElement,
	) {
		downloads.push(this.download);
	});
	vi.mocked(loadQrLogo).mockReset();
});

afterEach(() => vi.restoreAllMocks());

function renderGenerator() {
	render(
		<MemoryRouter initialEntries={["/qr-code-generator"]}>
			<App />
		</MemoryRouter>,
	);
}

function enterContent(value: string) {
	fireEvent.change(screen.getByRole("textbox", { name: "Text or URL" }), {
		target: { value },
	});
}

function uploadLogo(file: File) {
	fireEvent.change(screen.getByLabelText(/Add logo|Replace logo/), {
		target: { files: [file] },
	});
}

function blobText(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsText(blob);
	});
}

it("preserves exact input and exports square PNG and SVG with the selected style and colors", async () => {
	renderGenerator();
	const input = screen.getByRole("textbox", { name: "Text or URL" });
	expect(input).toBeInstanceOf(HTMLInputElement);
	expect(input).toHaveAttribute("type", "text");
	const png = screen.getByRole("button", { name: "Download PNG" });
	const svg = screen.getByRole("button", { name: "Download SVG" });
	expect(png).toBeDisabled();
	enterContent("   ");
	expect(png).toBeDisabled();
	enterContent(" https://example.com/café?value=❤ ");
	await waitFor(() => expect(png).toBeEnabled());
	const preview = screen.getByRole("img", {
		name: "QR code preview",
	}) as HTMLCanvasElement;
	expect([preview.width, preview.height]).toEqual([512, 512]);
	fireEvent.click(screen.getByRole("radio", { name: "Rounded" }));
	fireEvent.change(screen.getByRole("combobox", { name: "Download size" }), {
		target: { value: "1024" },
	});
	fireEvent.change(screen.getByLabelText("Foreground color"), {
		target: { value: "#777777" },
	});
	fireEvent.change(screen.getByLabelText("Background color"), {
		target: { value: "#888888" },
	});
	expect(screen.getByText(/difficult for QR scanners/)).toBeInTheDocument();
	await waitFor(() => expect(svg).toBeEnabled());
	fireEvent.click(svg);
	await waitFor(() => expect(downloads).toContain("qr-code.svg"));
	expect(blobs[0].type).toBe("image/svg+xml;charset=utf-8");
	const svgText = await blobText(blobs[0]);
	expect(svgText).toContain('width="1024" height="1024"');
	expect(svgText).toContain('fill="#777777"');
	expect(svgText).toContain('fill="#888888"');
	expect(svgText).toContain('rx="0.3"');
	fireEvent.click(png);
	await waitFor(() => expect(downloads).toContain("qr-code.png"));
	expect(blobs[1].type).toBe("image/png");
	expect(pngDimensions).toContainEqual([1024, 1024]);
	expect([preview.width, preview.height]).toEqual([512, 512]);
	expect(context.roundRect).toHaveBeenCalled();
});

it("adds, replaces, and removes a logo while keeping size and language state", async () => {
	renderGenerator();
	enterContent("hello");
	vi.mocked(loadQrLogo).mockResolvedValueOnce(fakeLogo());
	uploadLogo(new File(["logo"], "logo.png", { type: "image/png" }));
	await waitFor(() => expect(screen.getByText("logo.png")).toBeInTheDocument());
	const slider = screen.getByRole("slider", { name: /Logo area/ });
	expect(slider).toHaveAttribute("min", "10");
	expect(slider).toHaveAttribute("max", "25");
	expect(slider).toHaveValue("20");
	fireEvent.change(slider, { target: { value: "25" } });
	expect(slider).toHaveValue("25");
	vi.mocked(loadQrLogo).mockResolvedValueOnce(fakeLogo("second.webp"));
	uploadLogo(new File(["logo"], "second.webp", { type: "image/webp" }));
	await waitFor(() =>
		expect(screen.getByText("second.webp")).toBeInTheDocument(),
	);
	expect(screen.queryByText("logo.png")).not.toBeInTheDocument();
	fireEvent.click(screen.getByRole("button", { name: "ID" }));
	expect(screen.getByRole("radio", { name: "Titik" })).toBeInTheDocument();
	expect(screen.getByRole("slider", { name: /Bidang logo/ })).toHaveValue("25");
	expect(screen.getByRole("textbox", { name: "Teks atau URL" })).toHaveValue(
		"hello",
	);
	expect(window.localStorage.getItem("portfolio-locale")).toBe("id");
	fireEvent.click(screen.getByRole("button", { name: "Hapus logo" }));
	expect(screen.queryByText("second.webp")).not.toBeInTheDocument();
	expect(screen.getByRole("slider", { name: /Bidang logo/ })).toBeDisabled();
});

it("keeps the previous logo after a failed replacement and disables exports when H cannot fit", async () => {
	renderGenerator();
	enterContent("x".repeat(1500));
	const png = screen.getByRole("button", { name: "Download PNG" });
	await waitFor(() => expect(png).toBeEnabled());
	vi.mocked(loadQrLogo).mockResolvedValueOnce(fakeLogo());
	uploadLogo(new File(["logo"], "logo.png", { type: "image/png" }));
	await waitFor(() =>
		expect(screen.getByText(/too long for a QR code/)).toBeInTheDocument(),
	);
	expect(png).toBeDisabled();
	vi.mocked(loadQrLogo).mockRejectedValueOnce(new LogoError("decode"));
	uploadLogo(new File(["bad"], "broken.png", { type: "image/png" }));
	await waitFor(() =>
		expect(screen.getByRole("alert")).toHaveTextContent("could not be opened"),
	);
	expect(screen.getByText("logo.png")).toBeInTheDocument();
	fireEvent.click(screen.getByRole("button", { name: "Remove logo" }));
	await waitFor(() => expect(png).toBeEnabled());
});

it("reports preview and export failures", async () => {
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValueOnce(null);
	renderGenerator();
	enterContent("hello");
	await waitFor(() =>
		expect(screen.getByRole("alert")).toHaveTextContent("could not be created"),
	);
	expect(screen.getByRole("button", { name: "Download PNG" })).toBeDisabled();
});

it("reports a failed PNG export", async () => {
	renderGenerator();
	enterContent("hello");
	const png = screen.getByRole("button", { name: "Download PNG" });
	await waitFor(() => expect(png).toBeEnabled());
	vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementationOnce(
		(callback) => callback(null),
	);
	fireEvent.click(png);
	await waitFor(() =>
		expect(screen.getByRole("alert")).toHaveTextContent(
			"could not be downloaded",
		),
	);
});
