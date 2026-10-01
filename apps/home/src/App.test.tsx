import { socialLinks } from "@portfolio/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const { enArticle, idArticle, articleState } = vi.hoisted(() => {
	const enArticle = {
		id: "english-article",
		slug: "english-article",
		locale: "en",
		title: "English article",
		summary: "English summary",
		topic: "Engineering",
		contentHtml: "<p>Full English article.</p>",
		status: "PUBLISHED",
		cover: {
			path: "articles/english-article/cover/cover.webp",
			url: "https://example.com/cover.webp",
		} as { path: string; url: string } | null,
		bodyImages: [],
		createdAt: "",
		updatedAt: "",
		publishedAt: "2026-10-01T00:00:00.000Z" as string | null,
	};
	const idArticle = {
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
		publishedAt: "2026-10-01T00:00:00.000Z" as string | null,
	};
	return {
		enArticle,
		idArticle,
		articleState: { en: [enArticle], id: [idArticle] },
	};
});

vi.mock("./hooks/usePublishedArticles", () => ({
	usePublishedArticles: (locale: "en" | "id") => ({
		data: articleState[locale],
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
		<QueryClientProvider client={new QueryClient()}>
			<MemoryRouter initialEntries={[route]}>
				<App />
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

beforeEach(() => {
	vi.restoreAllMocks();
	articleState.en = [enArticle];
	articleState.id = [idArticle];
	enArticle.publishedAt = "2026-10-01T00:00:00.000Z";
	idArticle.publishedAt = "2026-10-01T00:00:00.000Z";
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
			screen.getByRole("link", { name: /English article/ }),
		).toHaveAttribute("href", "/notes/english-article");
		expect(screen.getAllByRole("link", { name: "Tools" })[0]).toHaveAttribute(
			"href",
			"/tools/",
		);
	});

	it("shows cover cards and limits the homepage to three articles", () => {
		articleState.en = [
			enArticle,
			...Array.from({ length: 3 }, (_, index) => ({
				...enArticle,
				id: `english-${index + 2}`,
				slug: `english-${index + 2}`,
				title: `English article ${index + 2}`,
				cover: null,
			})),
		];
		renderApp();
		expect(screen.getByAltText("")).toHaveAttribute(
			"src",
			"https://example.com/cover.webp",
		);
		expect(screen.getAllByTestId("article-cover-placeholder")).toHaveLength(2);
		expect(screen.queryByText("English article 4")).not.toBeInTheDocument();
	});

	it("shows all article cards on the notes page", () => {
		articleState.en = [
			enArticle,
			...Array.from({ length: 3 }, (_, index) => ({
				...enArticle,
				id: `english-${index + 2}`,
				slug: `english-${index + 2}`,
				title: `English article ${index + 2}`,
				cover: null,
			})),
		];
		renderApp("/notes");
		expect(
			screen.getByRole("link", { name: /English article 4/ }),
		).toHaveAttribute("href", "/notes/english-4");
		expect(screen.getAllByTestId("article-cover-placeholder")).toHaveLength(3);
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
		await user.click(screen.getByRole("button", { name: "ID" }));
		expect(
			screen.getByRole("link", { name: /Artikel Indonesia/ }),
		).toBeInTheDocument();
		expect(screen.queryByText("English article")).not.toBeInTheDocument();
		expect(screen.getByTestId("article-cover-placeholder")).toBeInTheDocument();
	});

	it("returns to the notes list when switching language on an article", async () => {
		const user = userEvent.setup();
		renderApp("/notes/english-article");
		await user.click(screen.getByRole("button", { name: "ID" }));
		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Mengurai software di ruang publik.",
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /Artikel Indonesia/ }),
		).toHaveAttribute("href", "/notes/artikel-indonesia");
	});

	it("renders a published article body, breadcrumb, and publication date", async () => {
		window.localStorage.setItem("portfolio-locale", "en");
		const { container } = renderApp("/notes/english-article");
		const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
		expect(
			within(breadcrumb).getByRole("link", { name: "Home" }),
		).toHaveAttribute("href", "/");
		expect(
			within(breadcrumb).getByRole("link", { name: "Notes" }),
		).toHaveAttribute("href", "/notes");
		expect(breadcrumb.querySelector('[aria-current="page"]')).toHaveTextContent(
			"English article",
		);
		expect(screen.queryByRole("link", { name: "Back to notes" })).toBeNull();
		expect(container.querySelector("time")).toHaveAttribute(
			"datetime",
			"2026-10-01T00:00:00.000Z",
		);
		expect(container.querySelector("time")).toHaveTextContent(
			"October 1, 2026",
		);
		expect(
			screen.getByRole("heading", { level: 1, name: "English article" }),
		).toBeInTheDocument();
		expect(screen.getByText("Full English article.")).toBeInTheDocument();
		await waitFor(() =>
			expect(document.title).toBe("English article | Boy Boni Panjaitan"),
		);
	});

	it("localizes breadcrumb and publication date for an Indonesian article", () => {
		window.localStorage.setItem("portfolio-locale", "id");
		const { container } = renderApp("/notes/artikel-indonesia");
		const breadcrumb = screen.getByRole("navigation", {
			name: "Jejak navigasi",
		});
		expect(
			within(breadcrumb).getByRole("link", { name: "Beranda" }),
		).toHaveAttribute("href", "/");
		expect(
			within(breadcrumb).getByRole("link", { name: "Catatan" }),
		).toHaveAttribute("href", "/notes");
		expect(container.querySelector("time")).toHaveTextContent("1 Oktober 2026");
	});

	it.each([null, "invalid-date"])(
		"hides an unavailable publication date: %s",
		(publishedAt) => {
			enArticle.publishedAt = publishedAt;
			const { container } = renderApp("/notes/english-article");
			expect(container.querySelector("time")).toBeNull();
		},
	);

	it("sets article sharing metadata and resets it after navigation", async () => {
		window.localStorage.setItem("portfolio-locale", "id");
		const user = userEvent.setup();
		renderApp("/notes/english-article");
		await waitFor(() => {
			expect(
				document.head.querySelector('meta[property="og:type"]'),
			).toHaveAttribute("content", "article");
		});
		expect(document.documentElement.lang).toBe("id");
		expect(screen.getByRole("article")).toHaveAttribute("lang", "en");
		expect(
			document.head.querySelector('meta[property="article:published_time"]'),
		).toHaveAttribute("content", "2026-10-01T00:00:00.000Z");
		expect(
			document.head.querySelector('meta[name="twitter:card"]'),
		).toHaveAttribute("content", "summary_large_image");
		expect(
			document.head.querySelector('meta[name="twitter:image"]'),
		).toHaveAttribute("content", "https://example.com/cover.webp");

		const breadcrumb = screen.getByRole("navigation", {
			name: "Jejak navigasi",
		});
		await user.click(within(breadcrumb).getByRole("link", { name: "Beranda" }));
		await waitFor(() => {
			expect(
				document.head.querySelector('meta[property="og:type"]'),
			).toHaveAttribute("content", "website");
		});
		expect(
			document.head.querySelector('meta[property="article:published_time"]'),
		).toBeNull();
		expect(
			document.head.querySelector('meta[name="twitter:card"]'),
		).toHaveAttribute("content", "summary");
		expect(
			document.head.querySelector('meta[name="twitter:image"]'),
		).toBeNull();
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

	it("places the only language switcher in the footer", () => {
		renderApp();
		expect(
			screen.queryByRole("banner")?.querySelector(".locale-toggle"),
		).toBeNull();
		expect(
			screen.getByRole("contentinfo").querySelectorAll(".locale-toggle"),
		).toHaveLength(1);
		expect(screen.getAllByRole("button", { name: "EN" })).toHaveLength(1);
	});

	it("uses the shared social URLs in the footer", () => {
		window.localStorage.setItem("portfolio-locale", "en");
		renderApp();
		const social = screen.getByRole("navigation", { name: "Social media" });
		for (const [label, href] of [
			["Instagram", socialLinks.instagram],
			["Facebook", socialLinks.facebook],
			["GitHub", socialLinks.github],
		]) {
			expect(within(social).getByRole("link", { name: label })).toHaveAttribute(
				"href",
				href,
			);
		}
		expect(screen.queryByRole("link", { name: "Visit GitHub" })).toBeNull();
	});

	it("changes and persists the selected locale", async () => {
		window.localStorage.setItem("portfolio-locale", "id");
		const user = userEvent.setup();
		renderApp("/about");
		await user.click(screen.getByRole("button", { name: "EN" }));
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
