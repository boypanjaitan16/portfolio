import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LocaleProvider, useToolsLocale } from "../../toolsLocale";
import { PdfEditorPage } from "./PdfEditorPage";
import type { EditorPage, SourceDocument } from "./pdfModel";
import { downloadPdf, exportPdf, openPdf } from "./pdfService";

vi.mock("./PdfCanvas", () => ({
	PdfCanvas: ({ width, height }: { width: number; height: number }) => (
		<canvas style={{ width, height }} />
	),
}));

vi.mock("./pdfService", () => ({
	openPdf: vi.fn(),
	exportPdf: vi.fn(),
	downloadPdf: vi.fn(),
}));

const source = {
	id: "source",
	name: "sample.pdf",
	loadingTask: { destroy: vi.fn() },
} as unknown as SourceDocument;

function page(id: string, width: number, height: number): EditorPage {
	return {
		id,
		sourceId: source.id,
		sourceIndex: id === "first" ? 0 : 1,
		width,
		height,
		originX: 0,
		originTop: height,
		originalRotation: 0,
		rotation: 0,
		selected: false,
		annotations: [],
	};
}

function LanguageSwitch() {
	const { setLocale } = useToolsLocale();
	return (
		<button type="button" onClick={() => setLocale("en")}>
			Switch to English
		</button>
	);
}

async function loadEditor() {
	const user = userEvent.setup();
	render(
		<MemoryRouter>
			<LocaleProvider>
				<PdfEditorPage />
			</LocaleProvider>
		</MemoryRouter>,
	);
	await user.upload(
		screen.getByLabelText("Choose PDF files", { selector: "input" }),
		new File(["pdf"], "sample.pdf", { type: "application/pdf" }),
	);
	const stage = await screen.findByTestId("pdf-preview-stage");
	const viewport = stage.parentElement as HTMLDivElement;
	Object.defineProperty(viewport, "clientWidth", {
		configurable: true,
		value: 320,
	});
	fireEvent.resize(window);
	await waitFor(() => expect(Number.parseFloat(stage.style.width)).toBe(320));
	return { user, stage, viewport };
}

beforeEach(() => {
	window.localStorage.clear();
	vi.clearAllMocks();
	vi.mocked(openPdf).mockResolvedValue({
		source,
		pages: [page("first", 400, 600), page("second", 300, 400)],
	});
	vi.mocked(exportPdf).mockResolvedValue(new Uint8Array());
	vi.mocked(downloadPdf).mockClear();
});

afterEach(() => vi.restoreAllMocks());

it("fits the preview, keeps zoom across pages, and respects both limits", async () => {
	const { user, stage, viewport } = await loadEditor();
	const zoomIn = screen.getByRole("button", { name: "Zoom in" });
	const zoomOut = screen.getByRole("button", { name: "Zoom out" });

	await user.click(zoomIn);
	expect(Number.parseFloat(stage.style.width)).toBe(400);
	expect(
		screen.getByRole("button", { name: /Reset zoom to 100%: 125%/ }),
	).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "Select page 2" }));
	expect(Number.parseFloat(stage.style.width)).toBe(375);
	expect(
		screen.getByRole("button", { name: /Reset zoom to 100%: 125%/ }),
	).toBeInTheDocument();

	Object.defineProperty(viewport, "clientWidth", {
		configurable: true,
		value: 200,
	});
	fireEvent.resize(window);
	await waitFor(() =>
		expect(Number.parseFloat(stage.style.width)).toBeCloseTo(250),
	);

	await user.click(screen.getByRole("button", { name: "Rotate right 2" }));
	expect(Number.parseFloat(stage.style.width)).toBeCloseTo(250);
	expect(Number.parseFloat(stage.style.height)).toBeCloseTo(187.5);

	for (let index = 0; index < 7; index += 1) await user.click(zoomIn);
	expect(zoomIn).toBeDisabled();
	expect(
		screen.getByRole("button", { name: /Reset zoom to 100%: 300%/ }),
	).toBeInTheDocument();
	for (let index = 0; index < 10; index += 1) await user.click(zoomOut);
	expect(zoomOut).toBeDisabled();
	await user.click(
		screen.getByRole("button", { name: /Reset zoom to 100%: 50%/ }),
	);
	expect(Number.parseFloat(stage.style.width)).toBeCloseTo(200);
	expect(
		screen.getByRole("button", { name: /Reset zoom to 100%: 100%/ }),
	).toBeInTheDocument();
});

it("keeps annotation PDF coordinates after dragging at zoom and rotation", async () => {
	const { user, stage } = await loadEditor();
	await user.click(screen.getByRole("button", { name: "Text" }));
	const annotation = screen.getByRole("button", { name: "New text" });
	for (let index = 0; index < 4; index += 1)
		await user.click(screen.getByRole("button", { name: "Zoom in" }));
	expect(Number.parseFloat(annotation.style.left)).toBe(64);

	stage.getBoundingClientRect = () =>
		({ left: 100, top: 50, width: 640, height: 960 }) as DOMRect;
	annotation.setPointerCapture = vi.fn();
	fireEvent.pointerDown(annotation, {
		clientX: 174,
		clientY: 124,
		pointerId: 1,
	});
	fireEvent.pointerMove(annotation, {
		clientX: 206,
		clientY: 124,
		pointerId: 1,
	});
	fireEvent.pointerUp(annotation, { pointerId: 1 });
	expect(Number.parseFloat(annotation.style.left)).toBe(96);

	await user.click(screen.getByRole("button", { name: "Rotate right 1" }));
	stage.getBoundingClientRect = () =>
		({ left: 100, top: 50, width: 640, height: 426.6667 }) as DOMRect;
	const startX = 100 + 320 + (320 - 45 * (640 / 600));
	const startY = 50 + 65 * (640 / 600);
	fireEvent.pointerDown(annotation, {
		clientX: startX,
		clientY: startY,
		pointerId: 1,
	});
	fireEvent.pointerMove(annotation, {
		clientX: startX,
		clientY: startY + 20 * (640 / 600),
		pointerId: 1,
	});
	fireEvent.pointerUp(annotation, { pointerId: 1 });

	await user.click(screen.getByRole("button", { name: "Download PDF" }));
	await waitFor(() => expect(exportPdf).toHaveBeenCalled());
	const exportedPages = vi.mocked(exportPdf).mock.lastCall?.[0];
	expect(exportedPages?.[0].annotations[0]).toMatchObject({ x: 80, y: 40 });
	expect(exportedPages?.[0].rotation).toBe(90);
});

it("updates zoom controls and the signature dialog when the locale changes", async () => {
	window.localStorage.setItem("portfolio-locale", "id");
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
		{} as CanvasRenderingContext2D,
	);
	const user = userEvent.setup();
	render(
		<MemoryRouter>
			<LocaleProvider>
				<LanguageSwitch />
				<PdfEditorPage />
			</LocaleProvider>
		</MemoryRouter>,
	);
	await user.upload(
		screen.getByLabelText("Pilih file PDF", { selector: "input" }),
		new File(["pdf"], "sample.pdf", { type: "application/pdf" }),
	);
	expect(
		await screen.findByRole("group", { name: "Zoom pratinjau" }),
	).toBeInTheDocument();
	expect(
		screen.getByRole("button", { name: "Perbesar pratinjau" }),
	).toBeInTheDocument();
	expect(
		screen.getByRole("button", { name: "Perkecil pratinjau" }),
	).toBeInTheDocument();
	await user.click(screen.getByRole("button", { name: "Tanda tangan" }));
	expect(
		screen.getByRole("dialog", { name: "Gambar tanda tangan" }),
	).toBeInTheDocument();
	expect(
		screen.getByText("Gambar dengan mouse, jari, atau pena."),
	).toBeInTheDocument();
	await user.click(screen.getByRole("button", { name: "Batal" }));
	await user.click(screen.getByRole("button", { name: "Switch to English" }));
	expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument();
	await user.click(screen.getByRole("button", { name: "Signature" }));
	expect(
		screen.getByRole("dialog", { name: "Draw a signature" }),
	).toBeInTheDocument();
	expect(
		screen.getByText("Draw with your mouse, finger, or pen."),
	).toBeInTheDocument();
	expect(window.localStorage.getItem("portfolio-locale")).toBe("en");
});
