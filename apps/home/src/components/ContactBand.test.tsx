import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { LocaleProvider } from "../i18n/LocaleProvider";
import { ContactBand } from "./ContactBand";

const state = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock("../lib/contactMessages", () => ({
	submitContactMessage: state.submit,
}));

function renderForm(locale: "en" | "id" = "en") {
	window.localStorage.setItem("portfolio-locale", locale);
	render(
		<QueryClientProvider client={new QueryClient()}>
			<LocaleProvider>
				<ContactBand />
			</LocaleProvider>
		</QueryClientProvider>,
	);
}

beforeEach(() => {
	state.submit.mockReset();
	window.localStorage.clear();
	window.history.replaceState(null, "", "/work");
});

it("validates and submits an English message once, then clears the form", async () => {
	let finish: (value: undefined) => void = () => {};
	state.submit.mockReturnValue(
		new Promise((resolve) => {
			finish = resolve;
		}),
	);
	const user = userEvent.setup();
	renderForm();
	await user.click(screen.getByRole("button", { name: "Send message" }));
	expect(screen.getByRole("status")).toHaveTextContent("Please enter a valid");
	await user.type(screen.getByRole("textbox", { name: "Name" }), " Ada ");
	await user.type(
		screen.getByRole("textbox", { name: "Email" }),
		"ada@example.com",
	);
	await user.type(
		screen.getByRole("textbox", { name: "Message" }),
		"I have a project question.",
	);
	await user.click(screen.getByRole("button", { name: "Send message" }));
	expect(state.submit).toHaveBeenCalledTimes(1);
	expect(state.submit.mock.calls[0][0]).toEqual({
		name: "Ada",
		email: "ada@example.com",
		message: "I have a project question.",
		locale: "en",
		sourcePath: "/work",
	});
	expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled();
	finish(undefined);
	await waitFor(() =>
		expect(screen.getByRole("status")).toHaveTextContent(
			"Your message has been sent",
		),
	);
	expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
});

it("keeps Indonesian input after a failed request", async () => {
	state.submit.mockRejectedValue(new Error("offline"));
	const user = userEvent.setup();
	renderForm("id");
	await user.type(screen.getByRole("textbox", { name: "Nama" }), "Budi");
	await user.type(
		screen.getByRole("textbox", { name: "Email" }),
		"budi@example.com",
	);
	await user.type(
		screen.getByRole("textbox", { name: "Pesan" }),
		"Saya ingin berdiskusi.",
	);
	await user.click(screen.getByRole("button", { name: "Kirim pesan" }));
	await waitFor(() =>
		expect(screen.getByRole("status")).toHaveTextContent(
			"Pesan belum dapat dikirim",
		),
	);
	expect(screen.getByRole("textbox", { name: "Nama" })).toHaveValue("Budi");
	expect(state.submit).toHaveBeenCalledTimes(1);
	expect(state.submit.mock.calls[0][0]).toEqual(
		expect.objectContaining({ locale: "id" }),
	);
});
