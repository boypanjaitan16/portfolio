import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createArticleShareLinks,
	getArticleShareUrl,
} from "../lib/articleShare";
import { ArticleShare } from "./ArticleShare";

const originalUrl = window.location.href;
const shareDescriptor = Object.getOwnPropertyDescriptor(navigator, "share");
const clipboardDescriptor = Object.getOwnPropertyDescriptor(
	navigator,
	"clipboard",
);

function setNavigatorProperty(name: "share" | "clipboard", value: unknown) {
	Object.defineProperty(navigator, name, { configurable: true, value });
}

function restoreNavigatorProperty(
	name: "share" | "clipboard",
	descriptor?: PropertyDescriptor,
) {
	if (descriptor) Object.defineProperty(navigator, name, descriptor);
	else Reflect.deleteProperty(navigator, name);
}

beforeEach(() => {
	window.history.replaceState(null, "", "/notes/a-story?source=home#section");
	setNavigatorProperty("share", undefined);
	setNavigatorProperty("clipboard", undefined);
});

afterEach(() => {
	window.history.replaceState(null, "", originalUrl);
	restoreNavigatorProperty("share", shareDescriptor);
	restoreNavigatorProperty("clipboard", clipboardDescriptor);
});

describe("article sharing links", () => {
	it("encodes the title and current URL for every channel", () => {
		const title = "A&B / C";
		const url = "https://preview.example/notes/a?source=x&mode=1#part";
		const links = createArticleShareLinks(title, url);
		expect(new URL(links.whatsapp).searchParams.get("text")).toBe(
			`${title} ${url}`,
		);
		expect(new URL(links.telegram).searchParams.get("url")).toBe(url);
		expect(new URL(links.telegram).searchParams.get("text")).toBe(title);
		expect(new URL(links.facebook).searchParams.get("u")).toBe(url);
		expect(new URL(links.x).searchParams.get("url")).toBe(url);
		expect(new URL(links.x).searchParams.get("text")).toBe(title);
	});

	it("keeps the opened URL for readers and emits the public URL during prerender", () => {
		const url = "http://127.0.0.1:4173/notes/a?source=x#part";
		expect(getArticleShareUrl(url)).toBe(url);
		expect(getArticleShareUrl(url, "https://boypanjaitan.com")).toBe(
			"https://boypanjaitan.com/notes/a?source=x#part",
		);
	});
});

describe("article share controls", () => {
	it("shows direct channels and copy when native sharing is unavailable", () => {
		render(<ArticleShare title="A story" locale="en" />);
		const panel = screen.getByRole("complementary", {
			name: "Share this article",
		});
		expect(
			within(panel).queryByRole("button", { name: "More options" }),
		).toBeNull();
		const copyButton = within(panel).getByRole("button", {
			name: "Copy link",
		});
		expect(copyButton).toHaveAttribute("aria-label", "Copy link");
		expect(copyButton.querySelector("svg")).toBeInTheDocument();
		expect(copyButton.textContent).toBe("");
		const links = createArticleShareLinks("A story", window.location.href);
		for (const [label, href] of [
			["WhatsApp", links.whatsapp],
			["Telegram", links.telegram],
			["Facebook", links.facebook],
			["X", links.x],
		]) {
			const link = within(panel).getByRole("link", { name: label });
			expect(link).toHaveAttribute("href", href);
			expect(link).toHaveAttribute("aria-label", label);
			expect(link.querySelector("svg")).toBeInTheDocument();
			expect(link.textContent).toBe("");
		}
	});

	it("opens native sharing with the current URL and ignores cancellation", async () => {
		const share = vi
			.fn()
			.mockRejectedValue(new DOMException("Cancelled", "AbortError"));
		setNavigatorProperty("share", share);
		const user = userEvent.setup();
		render(<ArticleShare title="A story" locale="en" />);
		await user.click(screen.getByRole("button", { name: "More options" }));
		expect(share).toHaveBeenCalledWith({
			title: "A story",
			url: window.location.href,
		});
		await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
	});

	it("reports a native sharing error", async () => {
		setNavigatorProperty(
			"share",
			vi.fn().mockRejectedValue(new Error("unavailable")),
		);
		const user = userEvent.setup();
		render(<ArticleShare title="A story" locale="en" />);
		await user.click(screen.getByRole("button", { name: "More options" }));
		expect(await screen.findByRole("status")).toHaveTextContent(
			"Couldn't open sharing",
		);
	});

	it("copies the current URL and confirms success", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		const user = userEvent.setup();
		setNavigatorProperty("clipboard", { writeText });
		render(<ArticleShare title="A story" locale="en" />);
		await user.click(screen.getByRole("button", { name: "Copy link" }));
		expect(writeText).toHaveBeenCalledWith(window.location.href);
		expect(await screen.findByRole("status")).toHaveTextContent("Link copied.");
	});

	it("offers a selectable URL when clipboard access is unavailable", async () => {
		const user = userEvent.setup();
		setNavigatorProperty("clipboard", undefined);
		render(<ArticleShare title="A story" locale="en" />);
		await user.click(screen.getByRole("button", { name: "Copy link" }));
		expect(screen.getByRole("status")).toHaveTextContent(
			"Couldn't copy automatically",
		);
		expect(screen.getByRole("textbox", { name: "Article link" })).toHaveValue(
			window.location.href,
		);
	});

	it("offers a selectable URL when copying fails", async () => {
		const user = userEvent.setup();
		setNavigatorProperty("clipboard", {
			writeText: vi.fn().mockRejectedValue(new Error("denied")),
		});
		render(<ArticleShare title="A story" locale="id" />);
		await user.click(screen.getByRole("button", { name: "Salin tautan" }));
		expect(await screen.findByRole("status")).toHaveTextContent(
			"Tidak dapat menyalin otomatis",
		);
		expect(screen.getByRole("textbox", { name: "Tautan artikel" })).toHaveValue(
			window.location.href,
		);
	});
});
