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

it("guards the contact inbox and opens it from admin navigation", async () => {
	state.authenticated = true;
	const user = userEvent.setup();
	renderApp("/");
	await user.click(
		within(
			screen.getByRole("navigation", { name: "Navigasi admin" }),
		).getByRole("link", { name: "Pesan" }),
	);
	expect(
		await screen.findByRole("heading", { name: "Pesan" }),
	).toBeInTheDocument();
	expect(
		screen.getByRole("navigation", { name: "Breadcrumb admin" }),
	).toHaveTextContent("Dashboard");
});

it("redirects a signed-out visitor from the contact inbox to login", async () => {
	renderApp("/contacts");
	expect(
		await screen.findByRole("heading", { name: "Masuk" }),
	).toBeInTheDocument();
});

it.each(["/profile", "/change-password"])(
	"guards the account route %s",
	async (path) => {
		renderApp(path);
		expect(
			await screen.findByRole("heading", { name: "Masuk" }),
		).toBeInTheDocument();
	},
);

it.each([
	{ path: "/profile", heading: "Ubah profil" },
	{ path: "/change-password", heading: "Ubah password" },
])("opens $path for an authenticated user", async ({ path, heading }) => {
	state.authenticated = true;
	renderApp(path);
	expect(
		await screen.findByRole("heading", { name: heading }),
	).toBeInTheDocument();
	expect(
		within(
			screen.getByRole("navigation", { name: "Breadcrumb admin" }),
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
		screen.queryByRole("button", { name: "Keluar" }),
	).not.toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "Editor" }));
	await user.click(
		await screen.findByRole("menuitem", { name: "Ubah profil" }),
	);
	expect(
		await screen.findByRole("heading", { name: "Ubah profil" }),
	).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "Editor" }));
	await user.click(
		await screen.findByRole("menuitem", { name: "Ubah password" }),
	);
	expect(
		await screen.findByRole("heading", { name: "Ubah password" }),
	).toBeInTheDocument();

	await user.click(screen.getByRole("button", { name: "Editor" }));
	await user.click(await screen.findByRole("menuitem", { name: "Keluar" }));
	expect(state.signOut).toHaveBeenCalledOnce();
	expect(
		await screen.findByRole("heading", { name: "Masuk" }),
	).toBeInTheDocument();
	expect(queryClient.getQueryData(["signout-test"])).toBeUndefined();
});

it.each([null, "   "])("shows Akun when the name is %s", async (name) => {
	state.authenticated = true;
	state.displayName = name;
	renderApp("/");
	await screen.findByRole("heading", { name: "Dashboard" });
	expect(screen.getByRole("button", { name: "Akun" })).toBeInTheDocument();
});

it("updates the header after saving a profile and retains it after a failed save", async () => {
	state.authenticated = true;
	const user = userEvent.setup();
	renderApp("/profile");
	await screen.findByRole("heading", { name: "Ubah profil" });
	expect(screen.getByRole("button", { name: "Editor" })).toBeInTheDocument();
	const name = screen.getByRole("textbox", { name: "Nama tampilan" });
	await user.clear(name);
	await user.type(name, "  Nama Baru  ");
	await user.click(screen.getByRole("button", { name: "Simpan profil" }));
	expect(
		await screen.findByText("Profil berhasil diperbarui."),
	).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Nama Baru" })).toBeInTheDocument();

	state.updateProfile.mockRejectedValueOnce({
		code: "auth/network-request-failed",
	});
	await user.clear(name);
	await user.type(name, "Nama Gagal");
	await user.click(screen.getByRole("button", { name: "Simpan profil" }));
	expect(
		await screen.findByText(
			"Koneksi bermasalah. Periksa internet lalu coba lagi.",
		),
	).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Nama Baru" })).toBeInTheDocument();
});
