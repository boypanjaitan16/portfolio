import type { Article } from "@portfolio/articles";
import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	runTransaction,
	updateDoc,
} from "firebase/firestore";
import type { ArticleFormValues } from "../schemas/articleSchema";
import {
	deleteArticleImage,
	type PendingImage,
	prepareArticleMedia,
} from "./articleMedia";
import { getFirestoreDb } from "./firebase";

export async function listArticles(): Promise<Article[]> {
	const snapshot = await getDocs(
		query(
			collection(getFirestoreDb(), "articles"),
			orderBy("updatedAt", "desc"),
		),
	);
	return snapshot.docs.map((item) => item.data() as Article);
}

export async function getArticle(id: string): Promise<Article | null> {
	const snapshot = await getDoc(doc(getFirestoreDb(), "articles", id));
	return snapshot.exists() ? (snapshot.data() as Article) : null;
}

export type SaveArticleInput = {
	values: ArticleFormValues;
	previous: Article | null;
	pendingImages: PendingImage[];
	coverFile: File | null;
	removeCover: boolean;
};

export async function saveArticle(
	input: SaveArticleInput,
): Promise<{ article: Article; cleanupFailed: boolean }> {
	const { values, previous, pendingImages, coverFile, removeCover } = input;
	const id = previous?.id ?? values.slug;
	const media = await prepareArticleMedia(
		id,
		values.contentHtml,
		pendingImages,
		coverFile,
		removeCover,
		previous,
	);
	const now = new Date().toISOString();
	const article: Article = {
		id,
		slug: id,
		locale: values.locale,
		title: values.title,
		summary: values.summary,
		topic: values.topic,
		contentHtml: media.contentHtml,
		status: values.status,
		cover: media.cover,
		bodyImages: media.bodyImages,
		createdAt: previous?.createdAt ?? now,
		updatedAt: now,
		publishedAt:
			values.status === "PUBLISHED"
				? previous?.status === "PUBLISHED"
					? previous.publishedAt
					: now
				: null,
	};

	try {
		const db = getFirestoreDb();
		if (previous) {
			await updateDoc(doc(db, "articles", id), article);
		} else {
			await runTransaction(db, async (transaction) => {
				const document = doc(db, "articles", id);
				const existing = await transaction.get(document);
				if (existing.exists()) throw new Error("Slug sudah digunakan.");
				transaction.set(document, article);
			});
		}
	} catch (error) {
		await Promise.allSettled(
			media.newImages.map((image) => deleteArticleImage(image)),
		);
		throw error;
	}

	const cleanup = await Promise.allSettled(
		media.obsoleteImages.map((image) => deleteArticleImage(image)),
	);
	return {
		article,
		cleanupFailed: cleanup.some((result) => result.status === "rejected"),
	};
}

export async function removeArticle(
	article: Article,
): Promise<{ cleanupFailed: boolean }> {
	await deleteDoc(doc(getFirestoreDb(), "articles", article.id));
	const images = [
		...article.bodyImages,
		...(article.cover ? [article.cover] : []),
	];
	const cleanup = await Promise.allSettled(
		images.map((image) => deleteArticleImage(image)),
	);
	return {
		cleanupFailed: cleanup.some((result) => result.status === "rejected"),
	};
}
