import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";

const pixels = [
	[255, 0, 0, 255],
	[0, 0, 255, 255],
	[0, 255, 0, 128],
	[9, 8, 7, 0],
] as const;

let writeText: ReturnType<typeof vi.fn>;
let createBitmap: ReturnType<typeof vi.fn>;

beforeEach(() => {
	window.localStorage.clear();
	writeText = vi.fn().mockResolvedValue(undefined);
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: { writeText },
	});
	createBitmap = vi
		.fn()
		.mockResolvedValue({ width: 2, height: 2, close: vi.fn() });
	vi.stubGlobal("createImageBitmap", createBitmap);
	const context = {
		drawImage: vi.fn(),
		getImageData: vi.fn((x: number, y: number) => ({
			data: new Uint8ClampedArray(pixels[y * 2 + x]),
		})),
	} as unknown as CanvasRenderingContext2D;
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
	vi.spyOn(
		HTMLCanvasElement.prototype,
		"getBoundingClientRect",
	).mockReturnValue({
		left: 10,
		top: 20,
		width: 200,
		height: 100,
		right: 210,
		bottom: 120,
		x: 10,
		y: 20,
		toJSON: () => ({}),
	});
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	Reflect.deleteProperty(document, "execCommand");
});

function renderPicker() {
	render(
		<MemoryRouter initialEntries={["/color-picker"]}>
			<App />
		</MemoryRouter>,
	);
}

async function upload(name = "sample.png", type = "image/png") {
	const input = screen.getByLabelText("Choose image");
	fireEvent.change(input, {
		target: { files: [new File(["image"], name, { type })] },
	});
	return screen.findByRole("button", {
		name: "Sample colors from the uploaded image",
	});
}

function selectedReadout() {
	return screen
		.getByRole("heading", { name: "Selected color" })
		.closest("section") as HTMLElement;
}

it("previews on hover, selects on click and touch, then copies the selected values", async () => {
	renderPicker();
	const canvasButton = await upload();
	fireEvent.pointerMove(canvasButton, {
		clientX: 30,
		clientY: 40,
		pointerType: "mouse",
	});
	expect(
		screen.getByRole("heading", { name: "Under cursor" }).closest("section"),
	).toHaveTextContent("#FF0000");
	fireEvent.pointerDown(canvasButton, {
		clientX: 30,
		clientY: 40,
		pointerType: "mouse",
		button: 0,
		pointerId: 1,
	});
	fireEvent.pointerUp(canvasButton, {
		clientX: 30,
		clientY: 40,
		pointerType: "mouse",
		pointerId: 1,
	});
	expect(selectedReadout()).toHaveTextContent("#FF0000");
	fireEvent.pointerMove(canvasButton, {
		clientX: 180,
		clientY: 40,
		pointerType: "mouse",
	});
	expect(selectedReadout()).toHaveTextContent("#FF0000");
	fireEvent.click(
		within(selectedReadout()).getByRole("button", { name: "Copy HEX" }),
	);
	await waitFor(() => expect(writeText).toHaveBeenCalledWith("#FF0000"));
	fireEvent.click(
		within(selectedReadout()).getByRole("button", { name: "Copy RGB" }),
	);
	await waitFor(() => expect(writeText).toHaveBeenCalledWith("rgb(255, 0, 0)"));
	writeText.mockRejectedValueOnce(new Error("denied"));
	fireEvent.click(
		within(selectedReadout()).getByRole("button", { name: "Copy HEX" }),
	);
	await waitFor(() =>
		expect(screen.getByRole("status")).toHaveTextContent(
			"Could not copy the color. Please try again.",
		),
	);
	fireEvent.pointerDown(canvasButton, {
		clientX: 30,
		clientY: 40,
		pointerType: "touch",
		pointerId: 2,
	});
	fireEvent.pointerMove(canvasButton, {
		clientX: 180,
		clientY: 40,
		pointerType: "touch",
		pointerId: 2,
	});
	fireEvent.pointerUp(canvasButton, {
		clientX: 180,
		clientY: 40,
		pointerType: "touch",
		pointerId: 2,
	});
	expect(selectedReadout()).toHaveTextContent("#0000FF");
});

it("supports keyboard sampling and suppresses copy controls for fully transparent pixels", async () => {
	renderPicker();
	const canvasButton = await upload();
	fireEvent.pointerDown(canvasButton, {
		clientX: 180,
		clientY: 95,
		pointerType: "mouse",
		button: 0,
		pointerId: 1,
	});
	fireEvent.pointerUp(canvasButton, {
		clientX: 180,
		clientY: 95,
		pointerType: "mouse",
		pointerId: 1,
	});
	expect(selectedReadout()).toHaveTextContent("Fully transparent pixel");
	expect(selectedReadout()).toHaveTextContent("0%");
	expect(
		within(selectedReadout()).queryByRole("button", { name: /Copy/ }),
	).not.toBeInTheDocument();
	fireEvent.keyDown(canvasButton, { key: "ArrowLeft" });
	fireEvent.keyDown(canvasButton, { key: "Enter" });
	expect(selectedReadout()).toHaveTextContent("#00FF00");
	expect(selectedReadout()).toHaveTextContent("50.2%");
});

it("keeps the current image after a bad file and clears the selection after replacement", async () => {
	renderPicker();
	const canvasButton = await upload();
	fireEvent.pointerDown(canvasButton, {
		clientX: 30,
		clientY: 40,
		pointerType: "mouse",
		button: 0,
		pointerId: 1,
	});
	fireEvent.pointerUp(canvasButton, {
		clientX: 30,
		clientY: 40,
		pointerType: "mouse",
		pointerId: 1,
	});
	expect(selectedReadout()).toHaveTextContent("#FF0000");
	await upload("vector.svg", "image/svg+xml");
	expect(screen.getByRole("alert")).toHaveTextContent(
		"Choose a PNG, JPEG, or WebP image.",
	);
	expect(selectedReadout()).toHaveTextContent("#FF0000");
	await upload("replacement.webp", "image/webp");
	await waitFor(() =>
		expect(selectedReadout()).toHaveTextContent(
			"Click or tap the image to select a color.",
		),
	);
	createBitmap.mockRejectedValueOnce(new Error("broken"));
	await upload("broken.jpg", "image/jpeg");
	await waitFor(() =>
		expect(screen.getByRole("alert")).toHaveTextContent(
			"This image could not be opened.",
		),
	);
});

it("accepts an image dropped into the preview", async () => {
	renderPicker();
	fireEvent.drop(screen.getByRole("group", { name: "Image preview" }), {
		dataTransfer: {
			files: [new File(["image"], "dropped.webp", { type: "image/webp" })],
		},
	});
	expect(
		await screen.findByRole("button", {
			name: "Sample colors from the uploaded image",
		}),
	).toBeInTheDocument();
	expect(screen.getByText(/dropped.webp/)).toBeInTheDocument();
});

it("falls back to selection copy when the Clipboard API is denied", async () => {
	renderPicker();
	const canvasButton = await upload();
	fireEvent.pointerDown(canvasButton, {
		clientX: 30,
		clientY: 40,
		pointerType: "mouse",
		button: 0,
		pointerId: 1,
	});
	fireEvent.pointerUp(canvasButton, {
		clientX: 30,
		clientY: 40,
		pointerType: "mouse",
		pointerId: 1,
	});
	writeText.mockRejectedValueOnce(new Error("denied"));
	const execCommand = vi.fn().mockReturnValue(true);
	Object.defineProperty(document, "execCommand", {
		configurable: true,
		value: execCommand,
	});
	fireEvent.click(
		within(selectedReadout()).getByRole("button", { name: "Copy HEX" }),
	);
	await waitFor(() =>
		expect(screen.getByRole("status")).toHaveTextContent("HEX copied."),
	);
	expect(execCommand).toHaveBeenCalledWith("copy");
	expect(document.querySelector("textarea")).not.toBeInTheDocument();
});
