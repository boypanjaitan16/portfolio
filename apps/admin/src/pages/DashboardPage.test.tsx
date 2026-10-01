import type {
	Article,
	ArticleLocale,
	ArticleStatus,
} from "@portfolio/articles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { articleKeys } from "../lib/queryKeys";
import { DashboardPage } from "./DashboardPage";

const state = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock("../lib/articles", async (importOriginal) => ({
	...(await importOriginal<typeof import("../lib/articles")>()),
	listArticles: state.list,
}));

function makeArticle(
	id: string,
	status: ArticleStatus,
	locale: ArticleLocale,
): Article {
	return {
		id,
		slug: id,
		locale,
		title: id,
		summary: "Summary",
		topic: "Engineering",
		contentHtml: "<p>Body</p>",
		status,
		cover: null,
		bodyImages: [],
		createdAt: "2026-10-01T00:00:00.000Z",
		updatedAt: "2026-10-01T00:00:00.000Z",
		publishedAt: status === "PUBLISHED" ? "2026-10-01T00:00:00.000Z" : null,
	};
}

function renderDashboard() {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	render(
		<QueryClientProvider client={client}>
			<DashboardPage />
		</QueryClientProvider>,
	);
	return client;
}

function articleCard() {
	return screen.getByRole("region", { name: "Artikel" });
}

function expectMetric(label: string, value: number) {
	const statistic = within(articleCard())
		.getByText(label)
		.closest(".ant-statistic");
	expect(statistic).not.toBeNull();
	expect(
		within(statistic as HTMLElement).getByText(String(value)),
	).toBeInTheDocument();
}

beforeEach(() => {
	state.list.mockReset();
});

it("shows one article card with published and draft counts across both languages", async () => {
	state.list.mockResolvedValue([
		makeArticle("en-public", "PUBLISHED", "en"),
		makeArticle("id-public", "PUBLISHED", "id"),
		makeArticle("en-draft", "DRAFT", "en"),
		makeArticle("id-draft", "DRAFT", "id"),
	]);
	renderDashboard();
	await waitFor(() => expectMetric("Terbit", 2));
	expectMetric("Draft", 2);
	expect(screen.getAllByRole("region")).toHaveLength(1);
	expect(screen.getByText("Ringkasan portal")).toBeInTheDocument();
	expect(
		screen.getByText("Lihat data yang dikelola di portal admin."),
	).toBeInTheDocument();
	expect(screen.queryByText("Total artikel")).not.toBeInTheDocument();
});

it("shows zero counts for an empty collection", async () => {
	state.list.mockResolvedValue([]);
	renderDashboard();
	await waitFor(() => expectMetric("Terbit", 0));
	expectMetric("Draft", 0);
});

it("keeps the article card visible during loading and query errors", async () => {
	state.list.mockImplementation(() => new Promise(() => {}));
	const { unmount } = render(
		<QueryClientProvider
			client={
				new QueryClient({ defaultOptions: { queries: { retry: false } } })
			}
		>
			<DashboardPage />
		</QueryClientProvider>,
	);
	expect(within(articleCard()).getByRole("status")).toHaveTextContent(
		"Memuat statistik artikel",
	);
	expect(within(articleCard()).queryByText("Terbit")).not.toBeInTheDocument();
	unmount();

	state.list.mockRejectedValue(new Error("Firestore tidak tersedia"));
	renderDashboard();
	expect(
		await within(articleCard()).findByText("Firestore tidak tersedia"),
	).toBeInTheDocument();
	expect(within(articleCard()).queryByText("Terbit")).not.toBeInTheDocument();
});

it("refreshes the article card when the shared list cache is invalidated", async () => {
	let articles = [makeArticle("first", "PUBLISHED", "en")];
	state.list.mockImplementation(async () => articles);
	const client = renderDashboard();
	await waitFor(() => expectMetric("Terbit", 1));
	expectMetric("Draft", 0);

	articles = [...articles, makeArticle("second", "DRAFT", "id")];
	await act(async () => {
		await client.invalidateQueries({ queryKey: articleKeys.list() });
	});
	await waitFor(() => expectMetric("Draft", 1));
	expectMetric("Terbit", 1);
});
