import type { Article, ArticleLocale } from "@portfolio/articles";
import { useQuery } from "@tanstack/react-query";
import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
	where,
} from "firebase/firestore";
import { getFirestoreDb } from "../lib/firebase";

export const publicArticleKeys = {
	list: (locale: ArticleLocale) => ["public", "articles", locale] as const,
	detail: (slug: string) => ["public", "article", slug] as const,
};

export async function fetchPublishedArticles(
	locale: ArticleLocale,
): Promise<Article[]> {
	const db = getFirestoreDb();
	const snapshot = await getDocs(
		query(
			collection(db, "articles"),
			where("status", "==", "PUBLISHED"),
			where("locale", "==", locale),
			orderBy("publishedAt", "desc"),
		),
	);
	return snapshot.docs.map((item) => item.data() as Article);
}

export async function fetchPublishedArticle(
	slug: string,
): Promise<Article | null> {
	const db = getFirestoreDb();
	const snapshot = await getDocs(
		query(
			collection(db, "articles"),
			where("slug", "==", slug),
			where("status", "==", "PUBLISHED"),
			limit(1),
		),
	);
	return snapshot.docs[0] ? (snapshot.docs[0].data() as Article) : null;
}

export function usePublishedArticles(locale: ArticleLocale) {
	return useQuery({
		queryKey: publicArticleKeys.list(locale),
		queryFn: () => fetchPublishedArticles(locale),
		staleTime: 30_000,
		refetchOnWindowFocus: true,
		retry: 1,
	});
}

export function usePublishedArticle(slug: string | undefined) {
	return useQuery({
		queryKey: publicArticleKeys.detail(slug ?? ""),
		queryFn: () => fetchPublishedArticle(slug ?? ""),
		enabled: Boolean(slug),
		staleTime: 30_000,
		refetchOnWindowFocus: true,
		retry: 1,
	});
}
