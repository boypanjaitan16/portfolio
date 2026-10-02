import type { Article } from "@portfolio/articles";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { removeArticle, saveArticle } from "./articles";

const mocks = vi.hoisted(() => ({
	prepareArticleMedia: vi.fn(),
	deleteArticleImage: vi.fn(),
	updateDoc: vi.fn(),
	deleteDoc: vi.fn(),
	runTransaction: vi.fn(),
	transactionGet: vi.fn(),
	transactionSet: vi.fn(),
}));

vi.mock("./articleMedia", () => ({
	prepareArticleMedia: mocks.prepareArticleMedia,
	deleteArticleImage: mocks.deleteArticleImage,
}));
vi.mock("./firebase", () => ({ getFirestoreDb: vi.fn(() => ({})) }));
vi.mock("firebase/firestore", () => ({
	collection: vi.fn(),
	doc: vi.fn((_db: unknown, _collection: string, id: string) => id),
	getDoc: vi.fn(),
	getDocs: vi.fn(),
	orderBy: vi.fn(),
	query: vi.fn(),
	deleteDoc: mocks.deleteDoc,
	updateDoc: mocks.updateDoc,
	runTransaction: mocks.runTransaction,
}));

const values = {
	locale: "en" as const,
	title: "A useful article",
	slug: "a-useful-article",
	summary: "Summary",
	topic: "Engineering",
	contentHtml: "<p>Body</p>",
	status: "PUBLISHED" as const,
};
const previous: Article = {
	id: values.slug,
	slug: values.slug,
	locale: "en",
	title: "Old",
	summary: "Old summary",
	topic: "Engineering",
	contentHtml: "<p>Old</p>",
	status: "DRAFT",
	cover: null,
	bodyImages: [],
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
	publishedAt: null,
};

beforeEach(() => {
	vi.clearAllMocks();
	mocks.prepareArticleMedia.mockResolvedValue({
		contentHtml: values.contentHtml,
		cover: null,
		bodyImages: [],
		newImages: [
			{ path: "articles/a-useful-article/body/new.jpg", url: "new-url" },
		],
		obsoleteImages: [],
	});
	mocks.deleteArticleImage.mockResolvedValue(undefined);
	mocks.updateDoc.mockResolvedValue(undefined);
	mocks.deleteDoc.mockResolvedValue(undefined);
	mocks.transactionGet.mockResolvedValue({ exists: () => false });
	mocks.runTransaction.mockImplementation(async (_db, callback) =>
		callback({
			get: mocks.transactionGet,
			set: mocks.transactionSet,
		}),
	);
});

describe("article writes", () => {
	it("creates a unique slug and sets publication time", async () => {
		const result = await saveArticle({
			values,
			previous: null,
			pendingImages: [],
			coverFile: null,
			removeCover: false,
		});
		expect(mocks.transactionSet).toHaveBeenCalledOnce();
		expect(result.article.id).toBe(values.slug);
		expect(result.article.publishedAt).toBeTruthy();
	});

	it("cleans newly uploaded media if a slug already exists", async () => {
		mocks.transactionGet.mockResolvedValue({ exists: () => true });
		await expect(
			saveArticle({
				values,
				previous: null,
				pendingImages: [],
				coverFile: null,
				removeCover: false,
			}),
		).rejects.toThrow("Slug is already in use.");
		expect(mocks.deleteArticleImage).toHaveBeenCalledWith({
			path: "articles/a-useful-article/body/new.jpg",
			url: "new-url",
		});
	});

	it("keeps previous media when Firestore update fails", async () => {
		mocks.updateDoc.mockRejectedValue(new Error("offline"));
		await expect(
			saveArticle({
				values,
				previous,
				pendingImages: [],
				coverFile: null,
				removeCover: false,
			}),
		).rejects.toThrow("offline");
		expect(mocks.deleteArticleImage).toHaveBeenCalledTimes(1);
	});

	it("reports a media cleanup failure after document deletion", async () => {
		mocks.deleteArticleImage.mockRejectedValue(
			new Error("storage unavailable"),
		);
		const result = await removeArticle({
			...previous,
			cover: { path: "cover", url: "url" },
		});
		expect(mocks.deleteDoc).toHaveBeenCalledOnce();
		expect(result.cleanupFailed).toBe(true);
	});
});
