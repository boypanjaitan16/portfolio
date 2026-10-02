import type { Article, ArticleImage } from "@portfolio/articles";
import {
	deleteObject,
	getDownloadURL,
	ref,
	uploadBytes,
} from "firebase/storage";
import { getFirebaseStorage } from "./firebase";

const allowedTypes = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
]);
const extensions: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
};

export function validateImage(file: File): void {
	if (!allowedTypes.has(file.type))
		throw new Error("Unsupported image format.");
	if (file.size > 5 * 1024 * 1024)
		throw new Error("Images must be 5 MB or smaller.");
}

export async function uploadArticleImage(
	articleId: string,
	kind: "cover" | "body",
	file: File,
): Promise<ArticleImage> {
	validateImage(file);
	const path =
		"articles/" +
		articleId +
		"/" +
		kind +
		"/" +
		crypto.randomUUID() +
		"." +
		extensions[file.type];
	const storageRef = ref(getFirebaseStorage(), path);
	await uploadBytes(storageRef, file, { contentType: file.type });
	try {
		return { path, url: await getDownloadURL(storageRef) };
	} catch (error) {
		await deleteObject(storageRef).catch(() => undefined);
		throw error;
	}
}

export async function deleteArticleImage(image: ArticleImage): Promise<void> {
	await deleteObject(ref(getFirebaseStorage(), image.path));
}

export type PendingImage = { url: string; file: File };

export async function prepareArticleMedia(
	articleId: string,
	contentHtml: string,
	pendingImages: PendingImage[],
	coverFile: File | null,
	removeCover: boolean,
	previous: Article | null,
): Promise<{
	contentHtml: string;
	cover: ArticleImage | null;
	bodyImages: ArticleImage[];
	newImages: ArticleImage[];
	obsoleteImages: ArticleImage[];
}> {
	const document = new DOMParser().parseFromString(contentHtml, "text/html");
	const pending = new Map(
		pendingImages.map((image) => [image.url, image.file]),
	);
	const existing = new Map(
		previous?.bodyImages.map((image) => [image.url, image]) ?? [],
	);
	const newImages: ArticleImage[] = [];
	const bodyImages: ArticleImage[] = [];
	const uploadedByUrl = new Map<string, ArticleImage>();
	let cover: ArticleImage | null = removeCover
		? null
		: (previous?.cover ?? null);

	try {
		for (const element of document.querySelectorAll("img")) {
			const src = element.getAttribute("src") ?? "";
			const oldImage = existing.get(src);
			if (oldImage) {
				bodyImages.push(oldImage);
				continue;
			}
			const file = pending.get(src);
			if (!file) {
				element.remove();
				continue;
			}
			const image =
				uploadedByUrl.get(src) ??
				(await uploadArticleImage(articleId, "body", file));
			if (!uploadedByUrl.has(src)) {
				uploadedByUrl.set(src, image);
				newImages.push(image);
			}
			bodyImages.push(image);
			element.setAttribute("src", image.url);
		}

		if (coverFile) {
			cover = await uploadArticleImage(articleId, "cover", coverFile);
			newImages.push(cover);
		}
	} catch (error) {
		await Promise.allSettled(
			newImages.map((image) => deleteArticleImage(image)),
		);
		throw error;
	}

	const retained = new Set(bodyImages.map((image) => image.path));
	if (cover) retained.add(cover.path);
	const obsoleteImages = [
		...(previous?.bodyImages ?? []),
		...(previous?.cover ? [previous.cover] : []),
	].filter((image) => !retained.has(image.path));

	return {
		contentHtml: document.body.innerHTML,
		cover,
		bodyImages: [
			...new Map(bodyImages.map((image) => [image.path, image])).values(),
		],
		newImages,
		obsoleteImages,
	};
}
