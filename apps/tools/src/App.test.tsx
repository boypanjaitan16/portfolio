import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

beforeEach(() => window.localStorage.clear());

it("shows the available tools as a grid and opens the PDF editor", async () => {
	const user = userEvent.setup();
	render(
		<MemoryRouter initialEntries={["/"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		screen.getByRole("heading", { name: "Available tools" }),
	).toBeInTheDocument();
	const tool = screen.getByRole("link", { name: /PDF Editor/ });
	expect(tool).toHaveAttribute("href", "/pdf-editor");
	await user.click(tool);
	expect(
		screen.getByRole("heading", { name: "PDF Editor" }),
	).toBeInTheDocument();
	expect(screen.getByText("Add a PDF to start editing.")).toBeInTheDocument();
});

it("uses the portfolio locale preference and updates it from the language control", async () => {
	window.localStorage.setItem("portfolio-locale", "id");
	const user = userEvent.setup();
	render(
		<MemoryRouter>
			<App />
		</MemoryRouter>,
	);
	expect(
		screen.getByRole("heading", { name: "Tools berguna, siap digunakan." }),
	).toBeInTheDocument();
	expect(screen.getByRole("link", { name: /Editor PDF/ })).toBeInTheDocument();
	expect(
		screen.getByText(
			"Atur halaman dan tambahkan teks, gambar, atau tanda tangan. File tetap di browser Anda.",
		),
	).toBeInTheDocument();
	await user.click(screen.getByRole("button", { name: "EN" }));
	expect(
		screen.getByRole("heading", { name: "Useful tools, ready when you are." }),
	).toBeInTheDocument();
	expect(
		screen.getByText(
			"Arrange pages and add text, images, or a signature. Your files stay in your browser.",
		),
	).toBeInTheDocument();
	expect(window.localStorage.getItem("portfolio-locale")).toBe("en");
});

it("opens the PDF editor directly with the saved locale and updates its copy", async () => {
	window.localStorage.setItem("portfolio-locale", "id");
	const user = userEvent.setup();
	render(
		<MemoryRouter initialEntries={["/pdf-editor"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		screen.getByRole("heading", { name: "Editor PDF" }),
	).toBeInTheDocument();
	expect(
		screen.getByText("Tambahkan PDF untuk mulai mengedit."),
	).toBeInTheDocument();
	await user.click(screen.getByRole("button", { name: "EN" }));
	expect(
		screen.getByRole("heading", { name: "PDF Editor" }),
	).toBeInTheDocument();
	expect(screen.getByText("Add a PDF to start editing.")).toBeInTheDocument();
	expect(window.localStorage.getItem("portfolio-locale")).toBe("en");
});

it("opens the color picker from its card and shows its local translations", async () => {
	const user = userEvent.setup();
	render(
		<MemoryRouter initialEntries={["/"]}>
			<App />
		</MemoryRouter>,
	);
	const card = screen.getByRole("link", { name: /Color Picker/ });
	expect(card).toHaveAttribute("href", "/color-picker");
	await user.click(card);
	expect(
		screen.getByRole("heading", { name: "Color Picker" }),
	).toBeInTheDocument();
	expect(
		screen.getByText("Add an image to start picking colors."),
	).toBeInTheDocument();
});

it("opens the color picker directly with the saved locale and switches language", async () => {
	window.localStorage.setItem("portfolio-locale", "id");
	const user = userEvent.setup();
	render(
		<MemoryRouter initialEntries={["/color-picker"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		screen.getByRole("heading", { name: "Pemilih Warna" }),
	).toBeInTheDocument();
	expect(
		screen.getByText("Tambahkan gambar untuk mulai memilih warna."),
	).toBeInTheDocument();
	await user.click(screen.getByRole("button", { name: "EN" }));
	expect(
		screen.getByRole("heading", { name: "Color Picker" }),
	).toBeInTheDocument();
	expect(window.localStorage.getItem("portfolio-locale")).toBe("en");
});
