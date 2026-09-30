import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function renderApp(route = "/") {
	return render(
		<MemoryRouter initialEntries={[route]}>
			<App />
		</MemoryRouter>,
	);
}

beforeEach(() => {
	vi.restoreAllMocks();
	window.localStorage.clear();
	document.documentElement.lang = "";
	vi.stubGlobal("scrollTo", vi.fn());
});

describe("portfolio routes", () => {
	it("renders Red Index as the production homepage with primary destinations", () => {
		renderApp();

		expect(
			screen.getByRole("heading", { level: 1, name: /Boy Boni Panjaitan/i }),
		).toBeInTheDocument();
		expect(screen.getAllByText(/^Concept case study ·/)).toHaveLength(3);
		expect(
			screen.getAllByRole("link", { name: "Work" }).length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByRole("link", { name: "About" }).length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByRole("link", { name: "Notes" }).length,
		).toBeGreaterThan(0);
		expect(screen.getAllByRole("link", { name: "Tools" })[0]).toHaveAttribute(
			"href",
			"/tools/",
		);
	});

	it("renders the work index and keeps every placeholder clearly labelled", () => {
		renderApp("/work");

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Systems, interfaces, and the decisions between them.",
			}),
		).toBeInTheDocument();
		expect(screen.getAllByText(/^Concept case study ·/)).toHaveLength(3);
	});

	it("renders the about page with capabilities and working toolkit", () => {
		renderApp("/about");

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Engineering with a product point of view.",
			}),
		).toBeInTheDocument();
		expect(screen.getByText("Product engineering")).toBeInTheDocument();
		expect(screen.getByText("TypeScript")).toBeInTheDocument();
	});

	it("renders the article index as an honest writing queue", () => {
		renderApp("/notes");

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Working through software in public.",
			}),
		).toBeInTheDocument();
		expect(screen.getByText("00", { exact: false })).toBeInTheDocument();
		expect(
			screen.getByRole("link", {
				name: /Interfaces should explain themselves/,
			}),
		).toHaveAttribute("href", "/notes/interfaces-should-explain-themselves");
	});

	it("renders an article outline without presenting it as published", () => {
		renderApp("/notes/small-tools-long-shelf-life");

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Small tools, long shelf life",
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", {
				level: 2,
				name: "This essay is being prepared.",
			}),
		).toBeInTheDocument();
	});

	it("renders a useful not-found page for unknown routes", () => {
		renderApp("/missing-page");

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "This page does not exist.",
			}),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Back home" })).toHaveAttribute(
			"href",
			"/",
		);
	});
});

describe("locale and metadata", () => {
	it("uses the browser language when there is no stored preference", async () => {
		vi.spyOn(window.navigator, "language", "get").mockReturnValue("id-ID");
		renderApp("/notes");

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Mengurai software di ruang publik.",
			}),
		).toBeInTheDocument();
		await waitFor(() => expect(document.documentElement.lang).toBe("id"));
	});

	it("changes and persists the selected locale", async () => {
		window.localStorage.setItem("portfolio-locale", "id");
		const user = userEvent.setup();
		renderApp("/about");

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Engineering dengan sudut pandang produk.",
			}),
		).toBeInTheDocument();
		await user.click(screen.getAllByRole("button", { name: "EN" })[0]);

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Engineering with a product point of view.",
			}),
		).toBeInTheDocument();
		await waitFor(() => {
			expect(document.documentElement.lang).toBe("en");
			expect(window.localStorage.getItem("portfolio-locale")).toBe("en");
		});
	});

	it("updates the document metadata for the current page", async () => {
		renderApp("/work");

		await waitFor(() => {
			expect(document.title).toBe("Work | Boy Boni Panjaitan");
			expect(
				document.head.querySelector('link[rel="canonical"]'),
			).toHaveAttribute("href", "https://boypanjaitan.com/work");
		});
	});
});
