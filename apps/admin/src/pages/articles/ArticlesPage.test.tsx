import type { Article } from "@portfolio/articles";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { ArticlesPage } from "./ArticlesPage";

const state = vi.hoisted(() => ({ save: vi.fn(), remove: vi.fn() }));
const article: Article = {
	id: "admin-fixture",
	slug: "admin-fixture",
	locale: "id",
	title: "Admin fixture",
	summary: "Summary",
	topic: "Engineering",
	contentHtml: "<p>Body</p>",
	status: "PUBLISHED",
	cover: null,
	bodyImages: [],
	createdAt: "2026-10-01T00:00:00.000Z",
	updatedAt: "2026-10-01T00:00:00.000Z",
	publishedAt: "2026-10-01T00:00:00.000Z",
};

vi.mock("../../hooks/useArticles", () => ({
	useArticles: () => ({ data: [article], isLoading: false, error: null }),
	useSaveArticle: () => ({ mutateAsync: state.save, isPending: false }),
	useDeleteArticle: () => ({ mutateAsync: state.remove, isPending: false }),
}));

beforeEach(() => {
	state.save.mockReset().mockResolvedValue({ cleanupFailed: false });
	state.remove.mockReset().mockResolvedValue({ cleanupFailed: false });
});

function renderList() {
	return render(
		<MemoryRouter>
			<ArticlesPage />
		</MemoryRouter>,
	);
}

it("filters articles by publication status", async () => {
	const user = userEvent.setup();
	renderList();
	expect(screen.getByText("Admin fixture")).toBeInTheDocument();
	await user.click(screen.getByText("Draft"));
	expect(screen.queryByText("Admin fixture")).not.toBeInTheDocument();
	expect(screen.getByText("No articles yet.")).toBeInTheDocument();
});

it("changes status and asks before deleting an article", async () => {
	const user = userEvent.setup();
	renderList();
	await user.click(screen.getByRole("button", { name: "Move to draft" }));
	await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
	expect(state.save.mock.calls[0][0].values.status).toBe("DRAFT");
	await user.click(
		screen.getByRole("button", { name: "Delete Admin fixture" }),
	);
	expect(state.remove).not.toHaveBeenCalled();
	await user.click(screen.getByRole("button", { name: /^Delete$/ }));
	await waitFor(() => expect(state.remove).toHaveBeenCalledWith(article));
}, 10_000);
