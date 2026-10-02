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
