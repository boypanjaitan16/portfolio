import { z } from "zod";

export const articleSchema = z.object({
	locale: z.enum(["en", "id"]),
	title: z.string().trim().min(1, "Title is required."),
	slug: z
		.string()
		.trim()
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug may contain only lowercase letters, numbers, and hyphens.",
		),
	summary: z.string().trim().min(1, "Summary is required."),
	topic: z.string().trim().min(1, "Topic is required."),
	contentHtml: z.string().refine((html) => {
		const text = html
			.replace(/<[^>]*>/g, "")
			.replace(/&nbsp;/g, " ")
			.trim();
		return text.length > 0;
	}, "Article content is required."),
	status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
