import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { wheelStorageKey } from "./wheelModel";

beforeEach(() => {
	window.localStorage.clear();
	Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
		configurable: true,
		value(this: HTMLDialogElement) {
			this.setAttribute("open", "");
		},
	});
	Object.defineProperty(HTMLDialogElement.prototype, "close", {
		configurable: true,
		value(this: HTMLDialogElement) {
			this.removeAttribute("open");
		},
	});
	vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
		callback(0);
		return 1;
	});
	vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
	vi.stubGlobal(
		"matchMedia",
		vi.fn((query: string) => ({
			matches: false,
			media: query,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
			onchange: null,
		})),
	);
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function renderWheel() {
	return render(
		<MemoryRouter initialEntries={["/spinning-wheel"]}>
			<App />
		</MemoryRouter>,
	);
}

function itemList() {
	return screen
		.getByRole("heading", { name: "Items" })
		.closest("section") as HTMLElement;
}

it("manages names and colors, skips duplicate bulk entries, and restores the list", async () => {
	const user = userEvent.setup();
	const view = renderWheel();
	expect(screen.getByRole("button", { name: "Spin the wheel" })).toBeDisabled();
	await user.type(
		screen.getByRole("textbox", { name: "Item name" }),
		" Alice ",
	);
	await user.click(screen.getByRole("button", { name: "Add" }));
	const bulkPanel = screen
		.getByText("Add several items")
		.closest("details") as HTMLDetailsElement;
	expect(bulkPanel.open).toBe(false);
	await user.click(screen.getByText("Add several items"));
	expect(bulkPanel.open).toBe(true);
	await user.type(
		screen.getByRole("textbox", { name: "Add several items" }),
		"Bob\nalice\nCara\n",
	);
	await user.click(screen.getByRole("button", { name: "Add items" }));
	expect(bulkPanel.open).toBe(false);
	expect(screen.getByText("3 remaining")).toBeInTheDocument();
	expect(
		screen.getByText(/Skipped duplicate names: alice/),
	).toBeInTheDocument();
	await user.click(screen.getByText("Add several items"));
	await user.type(
		screen.getByRole("textbox", { name: "Add several items" }),
		"ALICE\nBOB",
	);
	await user.click(screen.getByRole("button", { name: "Add items" }));
	expect(bulkPanel.open).toBe(true);
	expect(
		screen.getByRole("textbox", { name: "Add several items" }),
	).toHaveValue("ALICE\nBOB");
	const color = screen.getByLabelText("Color for Alice") as HTMLInputElement;
	fireEvent.change(color, { target: { value: "#123456" } });
	expect(color).toHaveValue("#123456");
	await user.click(screen.getByRole("button", { name: "Edit Bob" }));
	const edit = within(itemList()).getAllByRole("textbox", {
		name: "Item name",
	})[1];
	await user.clear(edit);
	await user.type(edit, "ALICE");
	await user.click(screen.getByRole("button", { name: "Save" }));
	expect(screen.getByRole("alert")).toHaveTextContent(
		"That name is already on the wheel.",
	);
	await user.clear(edit);
	await user.type(edit, "Dina");
	await user.click(screen.getByRole("button", { name: "Save" }));
	await user.click(screen.getByRole("button", { name: "Remove Cara" }));
	expect(screen.getByText("2 remaining")).toBeInTheDocument();
	expect(
		screen.queryByRole("button", { name: "Remove Cara" }),
	).not.toBeInTheDocument();
	view.unmount();
	renderWheel();
	expect(screen.getByLabelText("Color for Alice")).toHaveValue("#123456");
	expect(
		screen.getByRole("button", { name: "Remove Dina" }),
	).toBeInTheDocument();
	expect(
		JSON.parse(window.localStorage.getItem(wheelStorageKey) ?? "[]"),
	).toHaveLength(2);
});

it("keeps the winner pending until confirmation and preserves the final wheel angle", async () => {
	const user = userEvent.setup();
	vi.spyOn(window.crypto, "getRandomValues").mockImplementation((array) => {
		(array as Uint32Array)[0] = 1;
		return array;
	});
	renderWheel();
	await user.click(screen.getByText("Add several items"));
	await user.type(
		screen.getByRole("textbox", { name: "Add several items" }),
		"Alice\nBob\nCara",
	);
	await user.click(screen.getByRole("button", { name: "Add items" }));
	await user.click(screen.getByRole("button", { name: "Spin the wheel" }));
	expect(screen.getByText("3 remaining")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Spinning…" })).toBeDisabled();
	expect(screen.getByRole("textbox", { name: "Item name" })).toBeDisabled();
	const wheel = screen.getByRole("img", {
		name: "Spinning wheel with the current entries",
	});
	expect(wheel).toHaveStyle({ transform: "rotate(2040deg)" });
	fireEvent.transitionEnd(wheel, { propertyName: "transform" });
	const dialog = screen.getByRole("dialog", { name: "Winner" });
	expect(dialog).toHaveAttribute("open");
	expect(dialog).toHaveTextContent("Bob");
	expect(
		dialog.querySelectorAll(".spinning-wheel-confetti-piece"),
	).toHaveLength(36);
	expect(screen.getByText("3 remaining")).toBeInTheDocument();
	expect(wheel).toHaveStyle({ transform: "rotate(2040deg)" });
	expect(screen.getByRole("button", { name: "Spin the wheel" })).toBeDisabled();
	expect(screen.getByRole("textbox", { name: "Item name" })).toBeDisabled();
	expect(
		JSON.parse(window.localStorage.getItem(wheelStorageKey) ?? "[]"),
	).toHaveLength(3);
	const confirm = within(dialog).getByRole("button", {
		name: "Confirm winner",
	});
	expect(confirm).toHaveFocus();
	const cancelEvent = fireEvent(
		dialog,
		new Event("cancel", { cancelable: true }),
	);
	expect(cancelEvent).toBe(false);
	fireEvent.pointerDown(dialog);
	expect(dialog).toHaveAttribute("open");
	await user.click(confirm);
	expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	expect(screen.getByText("2 remaining")).toBeInTheDocument();
	expect(
		screen.queryByRole("button", { name: "Remove Bob" }),
	).not.toBeInTheDocument();
	expect(
		JSON.parse(window.localStorage.getItem(wheelStorageKey) ?? "[]"),
	).toHaveLength(2);
	expect(screen.getByRole("button", { name: "Spin the wheel" })).toHaveFocus();
});

it("shows a pending final item immediately with reduced motion and removes it on confirmation", async () => {
	const user = userEvent.setup();
	vi.mocked(window.matchMedia).mockImplementation((query) => ({
		matches: true,
		media: query,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
		onchange: null,
	}));
	renderWheel();
	await user.type(screen.getByRole("textbox", { name: "Item name" }), "Solo");
	await user.click(screen.getByRole("button", { name: "Add" }));
	const soloLabel = within(
		screen.getByRole("img", {
			name: "Spinning wheel with the current entries",
		}),
	).getByText("Solo");
	expect(Number(soloLabel.getAttribute("y"))).toBeLessThan(40);
	await user.click(screen.getByRole("button", { name: "Spin the wheel" }));
	expect(screen.getByText("1 remaining")).toBeInTheDocument();
	expect(
		JSON.parse(window.localStorage.getItem(wheelStorageKey) ?? "[]"),
	).toHaveLength(1);
	const dialog = screen.getByRole("dialog", { name: "Winner" });
	expect(dialog).toHaveTextContent("Solo");
	await user.click(
		within(dialog).getByRole("button", { name: "Confirm winner" }),
	);
	expect(screen.getByText("0 remaining")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Spin the wheel" })).toBeDisabled();
	expect(screen.getByRole("textbox", { name: "Item name" })).toHaveFocus();
});

it("uses the saved Indonesian locale and updates it without losing items", async () => {
	window.localStorage.setItem("portfolio-locale", "id");
	const user = userEvent.setup();
	renderWheel();
	expect(
		screen.getByRole("heading", { name: "Roda Undian" }),
	).toBeInTheDocument();
	await user.type(screen.getByRole("textbox", { name: "Nama item" }), "Satu");
	await user.click(screen.getByRole("button", { name: "Tambah" }));
	await user.click(screen.getByRole("button", { name: "EN" }));
	expect(
		screen.getByRole("heading", { name: "Spinning Wheel" }),
	).toBeInTheDocument();
	expect(
		screen.getByRole("button", { name: "Remove Satu" }),
	).toBeInTheDocument();
	vi.mocked(window.matchMedia).mockImplementation((query) => ({
		matches: true,
		media: query,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
		onchange: null,
	}));
	await user.click(screen.getByRole("button", { name: "ID" }));
	await user.click(screen.getByRole("button", { name: "Putar roda" }));
	const dialog = screen.getByRole("dialog", { name: "Pemenang" });
	expect(dialog).toHaveTextContent(
		"Konfirmasi untuk menghapus Satu dari roda.",
	);
	await user.click(
		within(dialog).getByRole("button", { name: "Konfirmasi pemenang" }),
	);
	expect(screen.getByText("0 tersisa")).toBeInTheDocument();
});

it("keeps an unconfirmed winner after reloading the page", async () => {
	const user = userEvent.setup();
	vi.mocked(window.matchMedia).mockImplementation((query) => ({
		matches: true,
		media: query,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
		onchange: null,
	}));
	const view = renderWheel();
	await user.type(screen.getByRole("textbox", { name: "Item name" }), "Alice");
	await user.click(screen.getByRole("button", { name: "Add" }));
	await user.click(screen.getByRole("button", { name: "Spin the wheel" }));
	expect(screen.getByRole("dialog", { name: "Winner" })).toBeInTheDocument();
	view.unmount();
	renderWheel();
	expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	expect(
		screen.getByRole("button", { name: "Remove Alice" }),
	).toBeInTheDocument();
});

it("keeps the wheel usable and warns when browser storage fails", async () => {
	vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
		throw new Error("Storage unavailable");
	});
	const user = userEvent.setup();
	renderWheel();
	expect(screen.getByRole("status")).toHaveTextContent(
		"Browser storage is unavailable",
	);
	await user.type(screen.getByRole("textbox", { name: "Item name" }), "Alice");
	await user.click(screen.getByRole("button", { name: "Add" }));
	expect(
		screen.getByRole("button", { name: "Remove Alice" }),
	).toBeInTheDocument();
});
