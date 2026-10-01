export type ArticleLocale = "en" | "id";
export type ArticleStatus = "DRAFT" | "PUBLISHED";

export type ArticleImage = { path: string; url: string };

export type Article = {
	id: string;
	slug: string;
	locale: ArticleLocale;
	title: string;
	summary: string;
	topic: string;
	contentHtml: string;
	status: ArticleStatus;
	cover: ArticleImage | null;
	bodyImages: ArticleImage[];
	createdAt: string;
	updatedAt: string;
	publishedAt: string | null;
};

export function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
