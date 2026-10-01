import { beforeEach, expect, it, vi } from "vitest";
import { prepareArticleMedia, validateImage } from "./articleMedia";

const mocks = vi.hoisted(() => ({
	uploadBytes: vi.fn(),
	getDownloadURL: vi.fn(),
	deleteObject: vi.fn(),
	ref: vi.fn((_storage: unknown, path: string) => ({ fullPath: path })),
}));
vi.mock("firebase/storage", () => ({
	uploadBytes: mocks.uploadBytes,
	getDownloadURL: mocks.getDownloadURL,
	deleteObject: mocks.deleteObject,
	ref: mocks.ref,
}));
vi.mock("./firebase", () => ({ getFirebaseStorage: vi.fn(() => ({})) }));

beforeEach(() => {
	vi.clearAllMocks();
	mocks.uploadBytes.mockResolvedValue(undefined);
	mocks.deleteObject.mockResolvedValue(undefined);
	mocks.getDownloadURL.mockImplementation(
		async (reference) => `https://example.test/${reference.fullPath}`,
	);
});

it("rejects unsupported and oversized images before upload", () => {
	expect(() =>
		validateImage(new File(["x"], "test.svg", { type: "image/svg+xml" })),
	).toThrow();
	expect(() =>
		validateImage(
			new File([new Uint8Array(5 * 1024 * 1024 + 1)], "test.png", {
				type: "image/png",
			}),
		),
	).toThrow();
});

it("uploads a reused body image once and records one Storage object", async () => {
	const file = new File(["x"], "image.png", { type: "image/png" });
	const result = await prepareArticleMedia(
		"article",
		'<p><img src="blob:one"><img src="blob:one"></p>',
		[{ url: "blob:one", file }],
		null,
		false,
		null,
	);
	expect(mocks.uploadBytes).toHaveBeenCalledOnce();
	expect(result.bodyImages).toHaveLength(1);
	expect(result.contentHtml).not.toContain("blob:one");
});

it("deletes a prior upload when a later image upload fails", async () => {
	const file = new File(["x"], "image.png", { type: "image/png" });
	mocks.uploadBytes
		.mockResolvedValueOnce(undefined)
		.mockRejectedValueOnce(new Error("upload failed"));
	await expect(
		prepareArticleMedia(
			"article",
			'<p><img src="blob:one"><img src="blob:two"></p>',
			[
				{ url: "blob:one", file },
				{ url: "blob:two", file },
			],
			null,
			false,
			null,
		),
	).rejects.toThrow("upload failed");
	expect(mocks.deleteObject).toHaveBeenCalledOnce();
});
