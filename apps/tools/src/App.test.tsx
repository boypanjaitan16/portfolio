import { render, screen, within } from "@testing-library/react";
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

it("opens Images to PDF from its card and directly in the saved locale", async () => {
	const user = userEvent.setup();
	const { unmount } = render(
		<MemoryRouter initialEntries={["/"]}>
			<App />
		</MemoryRouter>,
	);
	const card = screen.getByRole("link", { name: /Images to PDF/ });
	expect(card).toHaveAttribute("href", "/image-to-pdf");
	await user.click(card);
	expect(
		await screen.findByRole("heading", { name: "Images to PDF" }),
	).toBeInTheDocument();
	unmount();
	window.localStorage.setItem("portfolio-locale", "id");
	render(
		<MemoryRouter initialEntries={["/image-to-pdf"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		await screen.findByRole("heading", { name: "Gambar ke PDF" }),
	).toBeInTheDocument();
	expect(
		screen.getByText("Setiap gambar menjadi satu halaman."),
	).toBeInTheDocument();
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

it("opens the QR code generator from its card and directly with the saved locale", async () => {
	const user = userEvent.setup();
	const { unmount } = render(
		<MemoryRouter initialEntries={["/"]}>
			<App />
		</MemoryRouter>,
	);
	const card = screen.getByRole("link", { name: /QR Code Generator/ });
	expect(card).toHaveAttribute("href", "/qr-code-generator");
	await user.click(card);
	expect(
		screen.getByRole("heading", { name: "QR Code Generator" }),
	).toBeInTheDocument();
	unmount();
	window.localStorage.setItem("portfolio-locale", "id");
	render(
		<MemoryRouter initialEntries={["/qr-code-generator"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		screen.getByRole("heading", { name: "Pembuat Kode QR" }),
	).toBeInTheDocument();
	expect(
		screen.getByText(/Buat kode QR dari teks atau URL/),
	).toBeInTheDocument();
});

it("opens the spinning wheel from its card and directly with the saved locale", async () => {
	const user = userEvent.setup();
	const { unmount } = render(
		<MemoryRouter initialEntries={["/"]}>
			<App />
		</MemoryRouter>,
	);
	const card = screen.getByRole("link", { name: /Spinning Wheel/ });
	expect(card).toHaveAttribute("href", "/spinning-wheel");
	await user.click(card);
	expect(
		screen.getByRole("heading", { name: "Spinning Wheel" }),
	).toBeInTheDocument();
	unmount();
	window.localStorage.setItem("portfolio-locale", "id");
	render(
		<MemoryRouter initialEntries={["/spinning-wheel"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		screen.getByRole("heading", { name: "Roda Undian" }),
	).toBeInTheDocument();
});

it("opens the image editor from its card and directly with the saved locale", async () => {
	const user = userEvent.setup();
	const { unmount } = render(
		<MemoryRouter initialEntries={["/"]}>
			<App />
		</MemoryRouter>,
	);
	const card = screen.getByRole("link", {
		name: /Image Editor & EXIF Remover/,
	});
	expect(card).toHaveAttribute("href", "/image-editor");
	await user.click(card);
	expect(
		screen.getByRole("heading", { name: "Image Editor & EXIF Remover" }),
	).toBeInTheDocument();
	unmount();
	window.localStorage.setItem("portfolio-locale", "id");
	render(
		<MemoryRouter initialEntries={["/image-editor"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		screen.getByRole("heading", { name: "Editor Gambar & Penghapus EXIF" }),
	).toBeInTheDocument();
});

it("opens the image compressor from its card and directly with the saved locale", async () => {
	const user = userEvent.setup();
	const { unmount } = render(
		<MemoryRouter initialEntries={["/"]}>
			<App />
		</MemoryRouter>,
	);
	const card = screen.getByRole("link", {
		name: /Image Compressor & Converter/,
	});
	expect(card).toHaveAttribute("href", "/image-compressor");
	await user.click(card);
	expect(
		screen.getByRole("heading", { name: "Image Compressor & Converter" }),
	).toBeInTheDocument();
	unmount();
	window.localStorage.setItem("portfolio-locale", "id");
	render(
		<MemoryRouter initialEntries={["/image-compressor"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		screen.getByRole("heading", { name: "Kompres & Konversi Gambar" }),
	).toBeInTheDocument();
});

it("lazy-loads the data formatter from its card and directly with the saved locale", async () => {
	const user = userEvent.setup();
	const { unmount } = render(
		<MemoryRouter initialEntries={["/"]}>
			<App />
		</MemoryRouter>,
	);
	const card = screen.getByRole("link", { name: /Data Formatter & Converter/ });
	expect(card).toHaveAttribute("href", "/data-formatter");
	await user.click(card);
	expect(
		await screen.findByRole("heading", { name: "Data Formatter & Converter" }),
	).toBeInTheDocument();
	unmount();
	window.localStorage.setItem("portfolio-locale", "id");
	render(
		<MemoryRouter initialEntries={["/data-formatter"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		await screen.findByRole("heading", { name: "Format & Konversi Data" }),
	).toBeInTheDocument();
});

it("shows the legal links in the shared footer and navigates between both pages", async () => {
	const user = userEvent.setup();
	render(
		<MemoryRouter initialEntries={["/"]}>
			<App />
		</MemoryRouter>,
	);
	const footer = screen.getByRole("contentinfo");
	expect(footer).toHaveTextContent("Privacy Policy");
	expect(footer).toHaveTextContent("Terms of Service");
	await user.click(screen.getByRole("link", { name: /PDF Editor/ }));
	expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
	await user.click(
		within(footer).getByRole("link", { name: "Privacy Policy" }),
	);
	expect(
		screen.getByRole("heading", { name: "Privacy Policy", level: 1 }),
	).toBeInTheDocument();
	expect(
		screen.getByText(/do not upload your input or generated files/),
	).toBeInTheDocument();
	expect(
		screen.getByText(/GitHub says it logs visitors' IP addresses/),
	).toBeInTheDocument();
	expect(
		screen.getByRole("link", { name: "portfolio contact form" }),
	).toHaveAttribute("href", "/#contact-title");
	await user.click(
		screen.getByRole("link", { name: /Read the Terms of Service/ }),
	);
	expect(
		screen.getByRole("heading", { name: "Terms of Service", level: 1 }),
	).toBeInTheDocument();
	expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
});

it("opens both legal routes directly in Indonesian and updates their copy and title", async () => {
	window.localStorage.setItem("portfolio-locale", "id");
	const user = userEvent.setup();
	render(
		<MemoryRouter initialEntries={["/terms-of-service"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		screen.getByRole("heading", { name: "Ketentuan Layanan", level: 1 }),
	).toBeInTheDocument();
	expect(document.title).toBe("Ketentuan Layanan | Boy's Tools");
	expect(
		screen.getByText(/Formulir tersebut terpisah dari Tools/),
	).toBeInTheDocument();
	await user.click(
		screen.getByRole("link", { name: /Baca Kebijakan Privasi/ }),
	);
	expect(
		screen.getByRole("heading", { name: "Kebijakan Privasi", level: 1 }),
	).toBeInTheDocument();
	expect(
		screen.getByText(/Penyimpanan lokal menyimpan pilihan bahasa/),
	).toBeInTheDocument();
	await user.click(screen.getByRole("button", { name: "EN" }));
	expect(
		screen.getByRole("heading", { name: "Privacy Policy", level: 1 }),
	).toBeInTheDocument();
	expect(document.title).toBe("Privacy Policy | Boy's Tools");
	expect(window.localStorage.getItem("portfolio-locale")).toBe("en");
});
