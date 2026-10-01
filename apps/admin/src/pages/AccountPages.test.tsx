import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "firebase/auth";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import type { AccountOutletContext } from "../lib/accountSession";
import { ChangePasswordPage } from "./ChangePasswordPage";
import { ProfilePage } from "./ProfilePage";

const auth = vi.hoisted(() => ({
	credential: vi.fn(),
	updateProfile: vi.fn(),
	reauthenticate: vi.fn(),
	updatePassword: vi.fn(),
}));
vi.mock("firebase/auth", () => ({
	EmailAuthProvider: { credential: auth.credential },
	updateProfile: auth.updateProfile,
	reauthenticateWithCredential: auth.reauthenticate,
	updatePassword: auth.updatePassword,
}));

const currentUser = {
	uid: "editor",
	email: "editor@example.com",
	displayName: "Nama Lama",
} as User;
const onDisplayNameChange = vi.fn();

beforeEach(() => {
	auth.credential.mockReset().mockReturnValue({ providerId: "password" });
	auth.updateProfile.mockReset().mockResolvedValue(undefined);
	auth.reauthenticate.mockReset().mockResolvedValue(undefined);
	auth.updatePassword.mockReset().mockResolvedValue(undefined);
	onDisplayNameChange.mockReset();
});

function renderPage(path: "/profile" | "/change-password") {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route
					element={
						<Outlet
							context={
								{
									user: currentUser,
									onDisplayNameChange,
								} satisfies AccountOutletContext
							}
						/>
					}
				>
					<Route path="/profile" element={<ProfilePage />} />
					<Route path="/change-password" element={<ChangePasswordPage />} />
				</Route>
			</Routes>
		</MemoryRouter>,
	);
}

it.each(["/profile", "/change-password"] as const)(
	"uses the full admin content width for %s",
	(path) => {
		const { container } = renderPage(path);
		expect(container.querySelector("main")).toHaveClass("max-w-[1440px]");
		expect(container.querySelector("form")).toHaveClass("w-full");
		expect(container.querySelector(".max-w-xl")).toBeNull();
		expect(container.querySelector(".shadow-soft")).toBeNull();
	},
);

it("shows the account email and requires a nonblank display name", async () => {
	const user = userEvent.setup();
	renderPage("/profile");
	expect(screen.getByText("editor@example.com")).toBeInTheDocument();
	const name = screen.getByRole("textbox", { name: "Nama tampilan" });
	await user.clear(name);
	await user.type(name, "   ");
	await user.click(screen.getByRole("button", { name: "Simpan profil" }));
	expect(
		await screen.findByText("Nama tampilan wajib diisi."),
	).toBeInTheDocument();
	expect(auth.updateProfile).not.toHaveBeenCalled();
});

it("saves a trimmed display name and reports Firebase failures", async () => {
	const user = userEvent.setup();
	renderPage("/profile");
	const name = screen.getByRole("textbox", { name: "Nama tampilan" });
	await user.clear(name);
	await user.type(name, "  Nama Baru  ");
	await user.click(screen.getByRole("button", { name: "Simpan profil" }));
	expect(
		await screen.findByText("Profil berhasil diperbarui."),
	).toBeInTheDocument();
	expect(auth.updateProfile).toHaveBeenCalledWith(currentUser, {
		displayName: "Nama Baru",
	});
	expect(onDisplayNameChange).toHaveBeenCalledWith("Nama Baru");
	expect(name).toHaveValue("Nama Baru");

	auth.updateProfile.mockRejectedValueOnce({
		code: "auth/network-request-failed",
	});
	await user.clear(name);
	await user.type(name, "Nama Lain");
	await user.click(screen.getByRole("button", { name: "Simpan profil" }));
	expect(
		await screen.findByText(
			"Koneksi bermasalah. Periksa internet lalu coba lagi.",
		),
	).toBeInTheDocument();
	expect(onDisplayNameChange).toHaveBeenCalledTimes(1);
});

async function fillPasswords(
	user: ReturnType<typeof userEvent.setup>,
	current: string,
	next: string,
	confirmation: string,
) {
	await user.type(screen.getByLabelText("Password saat ini"), current);
	await user.type(screen.getByLabelText("Password baru"), next);
	await user.type(
		screen.getByLabelText("Konfirmasi password baru"),
		confirmation,
	);
}

it("validates required, minimum-length, and matching passwords", async () => {
	const user = userEvent.setup();
	renderPage("/change-password");
	await user.click(screen.getByRole("button", { name: "Simpan password" }));
	expect(
		await screen.findByText("Password saat ini wajib diisi."),
	).toBeInTheDocument();
	expect(
		screen.getByText("Password baru minimal 6 karakter."),
	).toBeInTheDocument();
	expect(
		screen.getByText("Konfirmasi password wajib diisi."),
	).toBeInTheDocument();
	expect(auth.reauthenticate).not.toHaveBeenCalled();

	await fillPasswords(
		user,
		"old-password",
		"new-password",
		"different-password",
	);
	await user.click(screen.getByRole("button", { name: "Simpan password" }));
	expect(
		await screen.findByText("Konfirmasi password tidak cocok."),
	).toBeInTheDocument();
	expect(auth.reauthenticate).not.toHaveBeenCalled();
});

it("reauthenticates before changing the password and clears the form", async () => {
	const user = userEvent.setup();
	renderPage("/change-password");
	await fillPasswords(user, "old-password", "new-password", "new-password");
	await user.click(screen.getByRole("button", { name: "Simpan password" }));
	expect(
		await screen.findByText("Password berhasil diubah."),
	).toBeInTheDocument();
	expect(auth.credential).toHaveBeenCalledWith(
		"editor@example.com",
		"old-password",
	);
	expect(auth.reauthenticate).toHaveBeenCalledWith(currentUser, {
		providerId: "password",
	});
	expect(auth.updatePassword).toHaveBeenCalledWith(currentUser, "new-password");
	expect(auth.reauthenticate.mock.invocationCallOrder[0]).toBeLessThan(
		auth.updatePassword.mock.invocationCallOrder[0],
	);
	expect(screen.getByLabelText("Password saat ini")).toHaveValue("");
	expect(screen.getByLabelText("Password baru")).toHaveValue("");
});

it("reports a wrong current password without changing it or exposing the input", async () => {
	auth.reauthenticate.mockRejectedValueOnce({
		code: "auth/invalid-credential",
	});
	const user = userEvent.setup();
	renderPage("/change-password");
	await fillPasswords(user, "secret-current", "new-password", "new-password");
	await user.click(screen.getByRole("button", { name: "Simpan password" }));
	expect(
		await screen.findByText("Password saat ini salah. Periksa lalu coba lagi."),
	).toBeInTheDocument();
	expect(auth.updatePassword).not.toHaveBeenCalled();
	expect(screen.queryByText("secret-current")).not.toBeInTheDocument();
});

it("shows a useful error when Firebase rejects the new password", async () => {
	auth.updatePassword.mockRejectedValueOnce({ code: "auth/weak-password" });
	const user = userEvent.setup();
	renderPage("/change-password");
	await fillPasswords(user, "old-password", "new-password", "new-password");
	await user.click(screen.getByRole("button", { name: "Simpan password" }));
	expect(
		await screen.findByText(
			"Password baru terlalu lemah. Gunakan password yang lebih kuat.",
		),
	).toBeInTheDocument();
});
