import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import App from "./App";

const state = vi.hoisted(() => ({ authenticated: false }));
vi.mock("./hooks/useFirebaseSession", () => ({
	useFirebaseSession: () => ({
		user: state.authenticated ? { uid: "editor" } : null,
		checking: false,
		error: null,
	}),
}));
vi.mock("./hooks/useArticles", () => ({
	useArticles: () => ({ data: [], isLoading: false, error: null }),
	useArticle: () => ({ data: null, isLoading: false, error: null }),
	useSaveArticle: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useDeleteArticle: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

beforeEach(() => {
	state.authenticated = false;
});

function renderApp(route: string) {
	const client = new QueryClient();
	return render(
		<QueryClientProvider client={client}>
			<MemoryRouter initialEntries={[route]}>
				<App />
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

it("redirects a signed-out visitor to login", () => {
	renderApp("/");
	expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
});

it("shows article management to an authenticated user", async () => {
	state.authenticated = true;
	renderApp("/articles");
	expect(
		await screen.findByRole("heading", { name: "Artikel" }),
	).toBeInTheDocument();
	expect(
		screen.getByRole("button", { name: /Artikel baru/ }),
	).toBeInTheDocument();
});

it("opens the private dashboard at the admin root and navigates to articles", async () => {
	state.authenticated = true;
	const user = userEvent.setup();
	renderApp("/");
	expect(
		await screen.findByRole("heading", { name: "Dashboard" }),
	).toBeInTheDocument();
	expect(screen.getByRole("region", { name: "Artikel" })).toBeInTheDocument();
	expect(screen.getByRole("link", { name: /Portfolio admin/ })).toHaveAttribute(
		"href",
		"/",
	);
	await user.click(screen.getByRole("link", { name: /^Artikel$/ }));
	expect(
		await screen.findByRole("heading", { name: "Artikel" }),
	).toBeInTheDocument();
	await user.click(
		within(
			screen.getByRole("navigation", { name: "Navigasi admin" }),
		).getByRole("link", { name: "Dashboard" }),
	);
	expect(
		await screen.findByRole("heading", { name: "Dashboard" }),
	).toBeInTheDocument();
});
