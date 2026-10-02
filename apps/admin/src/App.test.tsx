import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import App from "./App";
import { queryClient } from "./lib/queryClient";

const state = vi.hoisted(() => ({
	authenticated: false,
	displayName: "Editor" as string | null,
	signOut: vi.fn(),
	updateProfile: vi.fn(),
}));
vi.mock("firebase/auth", async (importOriginal) => ({
	...(await importOriginal<typeof import("firebase/auth")>()),
	signOut: state.signOut,
	updateProfile: state.updateProfile,
}));
vi.mock("./lib/firebase", () => ({ getFirebaseAuth: () => ({}) }));
vi.mock("./hooks/useFirebaseSession", () => ({
	useFirebaseSession: () => ({
		user: state.authenticated
			? {
					uid: "editor",
					email: "editor@example.com",
					displayName: state.displayName,
				}
			: null,
		checking: false,
		error: null,
	}),
}));
vi.mock("./hooks/useContactMessages", () => ({
	useContactMessages: () => ({ data: [], isLoading: false, error: null }),
	useUpdateContactMessage: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useDeleteContactMessage: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("./hooks/useArticles", () => ({
	useArticles: () => ({ data: [], isLoading: false, error: null }),
	useArticle: () => ({ data: null, isLoading: false, error: null }),
	useSaveArticle: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useDeleteArticle: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

beforeEach(() => {
	state.authenticated = false;
	state.displayName = "Editor";
	state.signOut.mockReset().mockResolvedValue(undefined);
	state.updateProfile.mockReset().mockResolvedValue(undefined);
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
	expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
});

it("shows article management to an authenticated user", async () => {
	state.authenticated = true;
	renderApp("/articles");
	expect(
		await screen.findByRole("heading", { name: "Articles" }),
	).toBeInTheDocument();
	expect(
		screen.getByRole("button", { name: /New article/ }),
	).toBeInTheDocument();
});

it("opens the private dashboard at the admin root and navigates to articles", async () => {
	state.authenticated = true;
	const user = userEvent.setup();
	renderApp("/");
	expect(
		await screen.findByRole("heading", { name: "Dashboard" }),
	).toBeInTheDocument();
	expect(screen.getByRole("region", { name: "Articles" })).toBeInTheDocument();
	expect(screen.getByRole("link", { name: /Portfolio admin/ })).toHaveAttribute(
		"href",
		"/",
	);
	await user.click(screen.getByRole("link", { name: /^Articles$/ }));
	expect(
		await screen.findByRole("heading", { name: "Articles" }),
	).toBeInTheDocument();
	await user.click(
		within(
			screen.getByRole("navigation", { name: "Admin navigation" }),
		).getByRole("link", { name: "Dashboard" }),
	);
	expect(
		await screen.findByRole("heading", { name: "Dashboard" }),
	).toBeInTheDocument();
});

it("guards the contact inbox and opens it from admin navigation", async () => {
	state.authenticated = true;
	const user = userEvent.setup();
	renderApp("/");
	await user.click(
		within(
			screen.getByRole("navigation", { name: "Admin navigation" }),
		).getByRole("link", { name: "Messages" }),
	);
	expect(
		await screen.findByRole("heading", { name: "Messages" }),
	).toBeInTheDocument();
	expect(
		screen.getByRole("navigation", { name: "Admin breadcrumb" }),
	).toHaveTextContent("Dashboard");
});

it("redirects a signed-out visitor from the contact inbox to login", async () => {
	renderApp("/contacts");
	expect(
		await screen.findByRole("heading", { name: "Sign in" }),
	).toBeInTheDocument();
});

it.each(["/profile", "/change-password"])(
	"guards the account route %s",
	async (path) => {
		renderApp(path);
		expect(
			await screen.findByRole("heading", { name: "Sign in" }),
		).toBeInTheDocument();
	},
);

it.each([
	{ path: "/profile", heading: "Edit profile" },
	{ path: "/change-password", heading: "Change password" },
])("opens $path for an authenticated user", async ({ path, heading }) => {
	state.authenticated = true;
	renderApp(path);
	expect(
		await screen.findByRole("heading", { name: heading }),
	).toBeInTheDocument();
	expect(
		within(
			screen.getByRole("navigation", { name: "Admin breadcrumb" }),
		).getByText(heading),
	).toBeInTheDocument();
});

it("opens both account pages from the dropdown and signs out", async () => {
	state.authenticated = true;
	queryClient.setQueryData(["signout-test"], "private data");
	const user = userEvent.setup();
	renderApp("/");
	await screen.findByRole("heading", { name: "Dashboard" });
	expect(
		screen.queryByRole("button", { name: "Sign out" }),
	).not.toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "Editor" }));
	await user.click(
		await screen.findByRole("menuitem", { name: "Edit profile" }),
	);
	expect(
		await screen.findByRole("heading", { name: "Edit profile" }),
	).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "Editor" }));
	await user.click(
		await screen.findByRole("menuitem", { name: "Change password" }),
	);
	expect(
		await screen.findByRole("heading", { name: "Change password" }),
	).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "Editor" }));
	await user.click(await screen.findByRole("menuitem", { name: "Sign out" }));
	expect(state.signOut).toHaveBeenCalledOnce();
	expect(
		await screen.findByRole("heading", { name: "Sign in" }),
	).toBeInTheDocument();
	expect(queryClient.getQueryData(["signout-test"])).toBeUndefined();
});

it.each([null, "   "])("shows Account when the name is %s", async (name) => {
	state.authenticated = true;
	state.displayName = name;
	renderApp("/");
	await screen.findByRole("heading", { name: "Dashboard" });
	expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument();
});

it("updates the header after saving a profile and retains it after a failed save", async () => {
	state.authenticated = true;
	const user = userEvent.setup();
	renderApp("/profile");
	await screen.findByRole("heading", { name: "Edit profile" });
	expect(screen.getByRole("button", { name: "Editor" })).toBeInTheDocument();
	const name = screen.getByRole("textbox", { name: "Display name" });
	await user.clear(name);
	await user.type(name, "  Nama Baru  ");
	await user.click(screen.getByRole("button", { name: "Save profile" }));
	expect(await screen.findByText("Profile updated.")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Nama Baru" })).toBeInTheDocument();

	state.updateProfile.mockRejectedValueOnce({
		code: "auth/network-request-failed",
	});
	await user.clear(name);
	await user.type(name, "Nama Gagal");
	await user.click(screen.getByRole("button", { name: "Save profile" }));
	expect(
		await screen.findByText(
			"Connection problem. Check your internet connection and try again.",
		),
	).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Nama Baru" })).toBeInTheDocument();
});
