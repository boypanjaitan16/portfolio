import type { ContactMessage } from "@portfolio/contact";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { ContactsPage } from "./ContactsPage";

const state = vi.hoisted(() => ({
	update: vi.fn(),
	remove: vi.fn(),
	messages: [] as ContactMessage[],
}));
vi.mock("../../hooks/useContactMessages", () => ({
	useContactMessages: () => ({
		data: state.messages,
		isLoading: false,
		error: null,
	}),
	useUpdateContactMessage: () => ({
		mutateAsync: state.update,
		isPending: false,
	}),
	useDeleteContactMessage: () => ({
		mutateAsync: state.remove,
		isPending: false,
	}),
}));

beforeEach(() => {
	state.update.mockReset().mockResolvedValue(undefined);
	state.remove.mockReset().mockResolvedValue(undefined);
	state.messages = [
		{
			id: "a",
			name: "Ada",
			email: "ada@example.com",
			message: "I would like to discuss a project.",
			locale: "en",
			sourcePath: "/work",
			status: "NEW",
			adminNote: "",
			createdAt: "2026-10-01T01:00:00.000Z",
			updatedAt: "2026-10-01T01:00:00.000Z",
		},
		{
			id: "b",
			name: "Budi",
			email: "budi@example.com",
			message: "Terima kasih sudah membalas pesan saya.",
			locale: "id",
			sourcePath: "/about",
			status: "DONE",
			adminNote: "Replied",
			createdAt: "2026-09-30T01:00:00.000Z",
			updatedAt: "2026-09-30T01:00:00.000Z",
		},
	];
});

it("filters the inbox and opens a private message with a reply link", async () => {
	const user = userEvent.setup();
	render(<ContactsPage />);
	expect(screen.getByText("Ada")).toBeInTheDocument();
	expect(screen.getByText("Budi")).toBeInTheDocument();
	await user.click(
		screen.getByRole("radio", { name: "Baru" }).closest("label") as HTMLElement,
	);
	expect(screen.getByText("Ada")).toBeInTheDocument();
	expect(screen.queryByText("Budi")).toBeNull();
	await user.click(screen.getByRole("button", { name: "Lihat" }));
	const drawer = await screen.findByRole("dialog", { name: "Detail pesan" });
	expect(
		within(drawer).getByText("I would like to discuss a project."),
	).toBeInTheDocument();
	expect(
		within(drawer).getByRole("link", { name: "Balas melalui email" }),
	).toHaveAttribute("href", "mailto:ada@example.com");
	expect(within(drawer).getByText(/\/work/)).toBeInTheDocument();
});

it("saves a private note and confirms deletion", async () => {
	const user = userEvent.setup();
	render(<ContactsPage />);
	await user.click(screen.getAllByRole("button", { name: "Lihat" })[0]);
	const drawer = await screen.findByRole("dialog", { name: "Detail pesan" });
	await user.click(within(drawer).getByRole("combobox", { name: "Status" }));
	await user.click(
		screen.getByText("Diproses", {
			selector: ".ant-select-item-option-content",
		}),
	);
	fireEvent.change(
		within(drawer).getByRole("textbox", { name: "Catatan privat" }),
		{
			target: { value: "Follow up tomorrow" },
		},
	);
	await user.click(
		within(drawer).getByRole("button", { name: "Simpan tindak lanjut" }),
	);
	await waitFor(() =>
		expect(state.update).toHaveBeenCalledWith({
			id: "a",
			status: "IN_PROGRESS",
			adminNote: "Follow up tomorrow",
		}),
	);
	await user.click(within(drawer).getByRole("button", { name: "Hapus pesan" }));
	await user.click(screen.getByRole("button", { name: "Hapus" }));
	await waitFor(() => expect(state.remove).toHaveBeenCalledWith("a"));
});
