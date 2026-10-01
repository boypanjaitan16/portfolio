import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";

const auth = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock("firebase/auth", () => ({ signInWithEmailAndPassword: auth.signIn }));
vi.mock("../lib/firebase", () => ({ getFirebaseAuth: () => ({}) }));

beforeEach(() => {
	auth.signIn.mockReset().mockResolvedValue({ user: { uid: "editor" } });
});

it("shows validation feedback before trying to sign in", async () => {
	const user = userEvent.setup();
	render(
		<MemoryRouter>
			<LoginPage />
		</MemoryRouter>,
	);
	await user.click(screen.getByRole("button", { name: "Masuk" }));
	expect(await screen.findByText("Email tidak valid.")).toBeInTheDocument();
	expect(screen.getByText("Password wajib diisi.")).toBeInTheDocument();
});

it("opens the dashboard after a direct login", async () => {
	const user = userEvent.setup();
	render(
		<MemoryRouter initialEntries={["/login"]}>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/" element={<h1>Dashboard tujuan</h1>} />
			</Routes>
		</MemoryRouter>,
	);
	await user.type(screen.getByLabelText("Email"), "editor@example.com");
	await user.type(screen.getByLabelText("Password"), "password123");
	await user.click(screen.getByRole("button", { name: "Masuk" }));
	expect(
		await screen.findByRole("heading", { name: "Dashboard tujuan" }),
	).toBeInTheDocument();
	expect(auth.signIn).toHaveBeenCalledWith(
		expect.anything(),
		"editor@example.com",
		"password123",
	);
});
