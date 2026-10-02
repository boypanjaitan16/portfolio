import type { Article } from "@portfolio/articles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { ArticleFormPage } from "./ArticleFormPage";

const state = vi.hoisted(() => ({ save: vi.fn() }));
const article: Article = {
	id: "existing-note",
	slug: "existing-note",
	locale: "id",
	title: "Existing note",
	summary: "Summary",
	topic: "Engineering",
	contentHtml: "<p>Existing body</p>",
	status: "DRAFT",
	cover: null,
	bodyImages: [],
	createdAt: "",
	updatedAt: "",
	publishedAt: null,
};

vi.mock("../../hooks/useArticles", () => ({
	useArticle: () => ({ data: article, isLoading: false, error: null }),
	useSaveArticle: () => ({ mutateAsync: state.save, isPending: false }),
}));
vi.mock("../../components/ArticleEditor", () => ({
	ArticleEditor: ({ content }: { content: string }) => (
		<div data-testid="editor">{content}</div>
	),
}));

beforeEach(() => {
	article.cover = null;
	state.save.mockReset().mockResolvedValue({ cleanupFailed: false });
});

function renderForm() {
	const client = new QueryClient();
	return render(
		<QueryClientProvider client={client}>
			<MemoryRouter initialEntries={["/articles/existing-note/edit"]}>
				<Routes>
					<Route path="/articles" element={null} />
					<Route
						path="/articles/:articleId/edit"
						element={<ArticleFormPage />}
					/>
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

it("loads an existing article into the form before mounting the editor", async () => {
	renderForm();
	expect(await screen.findByDisplayValue("Existing note")).toBeInTheDocument();
	expect(screen.getByTestId("editor")).toHaveTextContent("Existing body");
});

it("keeps cover upload pending until the article is submitted", async () => {
	const user = userEvent.setup();
	const { container } = renderForm();
	await screen.findByDisplayValue("Existing note");
	const file = new File(["image"], "cover.png", { type: "image/png" });
	const fileInput = container.querySelector('input[type="file"]');
	expect(fileInput).not.toBeNull();
	fireEvent.change(fileInput as HTMLInputElement, {
		target: { files: [file] },
	});
	expect(state.save).not.toHaveBeenCalled();
	await user.click(screen.getByRole("button", { name: "Save article" }));
	await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
	expect(state.save.mock.calls[0][0]).toMatchObject({
		previous: article,
		coverFile: file,
		removeCover: false,
	});
});

it("marks an existing cover for removal only when saving", async () => {
	article.cover = {
		path: "articles/existing-note/cover/old.png",
		url: "https://example.com/old.png",
	};
	const user = userEvent.setup();
	renderForm();
	await screen.findByDisplayValue("Existing note");
	await user.click(screen.getByRole("button", { name: "Remove file" }));
	expect(state.save).not.toHaveBeenCalled();
	await user.click(screen.getByRole("button", { name: "Save article" }));
	await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
	expect(state.save.mock.calls[0][0]).toMatchObject({
		coverFile: null,
		removeCover: true,
	});
});

it("accepts a dropped cover as a replacement and uploads it only on save", async () => {
	article.cover = {
		path: "articles/existing-note/cover/old.png",
		url: "https://example.com/old.png",
	};
	const user = userEvent.setup();
	const { container } = renderForm();
	await screen.findByDisplayValue("Existing note");
	const dropZone = container.querySelector(".ant-upload-btn");
	expect(dropZone).not.toBeNull();
	const file = new File(["replacement"], "replacement.png", {
		type: "image/png",
	});
	fireEvent.drop(dropZone as HTMLElement, {
		dataTransfer: { files: [file], items: [] },
	});
	expect(await screen.findByText("replacement.png")).toBeInTheDocument();
	expect(screen.queryByText("Current cover")).not.toBeInTheDocument();
	expect(state.save).not.toHaveBeenCalled();

	await user.click(screen.getByRole("button", { name: "Save article" }));
	await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
	expect(state.save.mock.calls[0][0]).toMatchObject({
		coverFile: file,
		removeCover: false,
	});
});

it("rejects an invalid cover without replacing the current cover", async () => {
	article.cover = {
		path: "articles/existing-note/cover/old.png",
		url: "https://example.com/old.png",
	};
	const { container } = renderForm();
	await screen.findByDisplayValue("Existing note");
	const fileInput = container.querySelector('input[type="file"]');
	expect(fileInput).not.toBeNull();
	fireEvent.change(fileInput as HTMLInputElement, {
		target: {
			files: [new File(["bad"], "invalid.txt", { type: "text/plain" })],
		},
	});
	expect(
		await screen.findByText("Unsupported image format."),
	).toBeInTheDocument();
	expect(screen.getByText("Current cover")).toBeInTheDocument();
	expect(screen.queryByText("invalid.txt")).not.toBeInTheDocument();
	expect(state.save).not.toHaveBeenCalled();
});
