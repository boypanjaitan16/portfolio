import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { downloadBlob } from "../../shared/download";
import { LocaleProvider } from "../../toolsLocale";
import { ImageToPdfPage } from "./ImageToPdfPage";
import { ConversionError, imagesToPdf, inspectImage } from "./pdfConversion";

vi.mock("../../shared/download", () => ({ downloadBlob: vi.fn() }));
vi.mock("./pdfConversion", async (importOriginal) => {
	const original = await importOriginal<typeof import("./pdfConversion")>();
	return {
		...original,
		inspectImage: vi.fn(),
		imagesToPdf: vi.fn(),
	};
});

function image(name: string) {
	return new File(["image"], name, { type: "image/png" });
}

function renderPage() {
	render(
		<MemoryRouter>
			<LocaleProvider>
				<ImageToPdfPage />
			</LocaleProvider>
		</MemoryRouter>,
	);
}

function add(...files: File[]) {
	fireEvent.change(screen.getByLabelText("Choose images"), {
		target: { files },
	});
}

beforeEach(() => {
	window.localStorage.clear();
	vi.mocked(inspectImage)
		.mockReset()
		.mockResolvedValue({ width: 1000, height: 500 });
	vi.mocked(imagesToPdf)
		.mockReset()
		.mockResolvedValue(new Uint8Array([1, 2, 3]));
	vi.mocked(downloadBlob).mockReset();
	let nextUrl = 0;
	vi.spyOn(URL, "createObjectURL").mockImplementation(
		() => `blob:image-${++nextUrl}`,
	);
	vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
});

it("accepts multiple images, reorders them, and downloads one PDF in list order", async () => {
	renderPage();
	const first = image("first.png");
	const second = image("second.png");
	add(first, second);
	await screen.findByText("second.png");
	const rows = () => within(screen.getByRole("list")).getAllByRole("listitem");
	expect(rows().map((row) => row.textContent)).toEqual([
		expect.stringContaining("first.png"),
		expect.stringContaining("second.png"),
	]);
	fireEvent.click(screen.getByRole("button", { name: "Move up second.png" }));
	expect(rows()[0]).toHaveTextContent("second.png");
	fireEvent.change(screen.getByLabelText("Page size"), {
		target: { value: "letter" },
	});
	fireEvent.click(screen.getByRole("button", { name: "Create PDF" }));
	await waitFor(() =>
		expect(imagesToPdf).toHaveBeenCalledWith([second, first], "letter"),
	);
	await waitFor(() => expect(downloadBlob).toHaveBeenCalledTimes(1));
	expect(downloadBlob).toHaveBeenCalledWith(
		expect.objectContaining({ type: "application/pdf" }),
		"images-to-pdf.pdf",
	);
});

it("accepts dropped images and releases previews when removed or cleared", async () => {
	renderPage();
	const first = image("dropped.png");
	fireEvent.drop(screen.getByText("Add images to create a PDF."), {
		dataTransfer: { files: [first] },
	});
	await screen.findByText("dropped.png");
	fireEvent.click(screen.getByRole("button", { name: "Remove dropped.png" }));
	expect(screen.queryByText("dropped.png")).not.toBeInTheDocument();
	expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:image-1");
	add(image("another.png"));
	await screen.findByText("another.png");
	fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
	expect(screen.getByText("Add images to create a PDF.")).toBeInTheDocument();
	expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:image-2");
});

it("reports rejected images and never downloads a failed conversion", async () => {
	vi.mocked(inspectImage)
		.mockRejectedValueOnce(new ConversionError("unsupported", "bad.gif"))
		.mockResolvedValueOnce({ width: 1000, height: 500 });
	renderPage();
	add(image("bad.gif"), image("good.png"));
	await screen.findByText("good.png");
	expect(screen.getByRole("alert")).toHaveTextContent(
		"bad.gif: use a PNG, JPEG, or WebP image.",
	);
	vi.mocked(imagesToPdf).mockRejectedValueOnce(
		new ConversionError("createFailed", "good.png"),
	);
	fireEvent.click(screen.getByRole("button", { name: "Create PDF" }));
	await waitFor(() =>
		expect(screen.getByRole("alert")).toHaveTextContent(
			"good.png: the PDF could not be created from this image.",
		),
	);
	expect(downloadBlob).not.toHaveBeenCalled();
});

it("limits the queue to 30 images", async () => {
	renderPage();
	add(...Array.from({ length: 31 }, (_, index) => image(`${index}.png`)));
	await screen.findByText("29.png");
	expect(
		within(screen.getByRole("list")).getAllByRole("listitem"),
	).toHaveLength(30);
	expect(screen.getByRole("alert")).toHaveTextContent(
		"Only 30 images can be added.",
	);
});
