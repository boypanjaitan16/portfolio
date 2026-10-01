import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const { enArticle, idArticle } = vi.hoisted(() => ({
	enArticle: {
		id: "english-article",
		slug: "english-article",
		locale: "en",
		title: "English article",
		summary: "English summary",
		topic: "Engineering",
		contentHtml: "<p>Full English article.</p>",
		status: "PUBLISHED",
		cover: null,
		bodyImages: [],
		createdAt: "",
		updatedAt: "",
		publishedAt: "",
	},
	idArticle: {
		id: "artikel-indonesia",
		slug: "artikel-indonesia",
		locale: "id",
		title: "Artikel Indonesia",
		summary: "Ringkasan Indonesia",
		topic: "Teknologi",
		contentHtml: "<p>Isi artikel Indonesia.</p>",
		status: "PUBLISHED",
		cover: null,
		bodyImages: [],
		createdAt: "",
		updatedAt: "",
		publishedAt: "",
	},
}));

vi.mock("./hooks/usePublishedArticles", () => ({
	usePublishedArticles: (locale: "en" | "id") => ({
		data: locale === "en" ? [enArticle] : [idArticle],
		isLoading: false,
		error: null,
	}),
	usePublishedArticle: (slug: string | undefined) => ({
		data:
			slug === enArticle.slug
				? enArticle
				: slug === idArticle.slug
					? idArticle
					: null,
		isLoading: false,
		error: null,
	}),
}));

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
	it("renders the homepage with the latest published article", () => {
		renderApp();
		expect(
			screen.getByRole("heading", { level: 1, name: /Boy Boni Panjaitan/i }),
		).toBeInTheDocument();
		expect(
			screen.getAllByRole("link", { name: "English article" })[0],
		).toHaveAttribute("href", "/notes/english-article");
		expect(screen.getAllByRole("link", { name: "Tools" })[0]).toHaveAttribute(
			"href",
			"/tools/",
		);
	});

	it("renders the work index", () => {
		renderApp("/work");
		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Systems, interfaces, and the decisions between them.",
			}),
		).toBeInTheDocument();
	});

	it("lists only the selected language's articles", async () => {
		const user = userEvent.setup();
		renderApp("/notes");
		expect(
			screen.getByRole("link", { name: /English article/ }),
		).toBeInTheDocument();
		expect(screen.queryByText("Artikel Indonesia")).not.toBeInTheDocument();
		await user.click(screen.getAllByRole("button", { name: "ID" })[0]);
		expect(
			screen.getByRole("link", { name: /Artikel Indonesia/ }),
		).toBeInTheDocument();
		expect(screen.queryByText("English article")).not.toBeInTheDocument();
	});

	it("renders a published article body and metadata", async () => {
		renderApp("/notes/english-article");
		expect(
			screen.getByRole("heading", { level: 1, name: "English article" }),
		).toBeInTheDocument();
		expect(screen.getByText("Full English article.")).toBeInTheDocument();
		await waitFor(() =>
			expect(document.title).toBe("English article | Boy Boni Panjaitan"),
		);
	});

	it("renders the not-found page for unknown routes", () => {
		renderApp("/missing-page");
		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "This page does not exist.",
			}),
		).toBeInTheDocument();
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
		expect(
			screen.getByRole("link", { name: /Artikel Indonesia/ }),
		).toBeInTheDocument();
		await waitFor(() => expect(document.documentElement.lang).toBe("id"));
	});

	it("changes and persists the selected locale", async () => {
		window.localStorage.setItem("portfolio-locale", "id");
		const user = userEvent.setup();
		renderApp("/about");
		await user.click(screen.getAllByRole("button", { name: "EN" })[0]);
		await waitFor(() =>
			expect(window.localStorage.getItem("portfolio-locale")).toBe("en"),
		);
	});

	it("updates the document metadata for static pages", async () => {
		renderApp("/work");
		await waitFor(() => {
			expect(document.title).toBe("Work | Boy Boni Panjaitan");
			expect(
				document.head.querySelector('link[rel="canonical"]'),
			).toHaveAttribute("href", "https://boypanjaitan.com/work");
		});
	});
});
