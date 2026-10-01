import { z } from "zod";

export const articleSchema = z.object({
	locale: z.enum(["en", "id"]),
	title: z.string().trim().min(1, "Judul wajib diisi."),
	slug: z
		.string()
		.trim()
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug hanya huruf kecil, angka, dan tanda hubung.",
		),
	summary: z.string().trim().min(1, "Ringkasan wajib diisi."),
	topic: z.string().trim().min(1, "Topik wajib diisi."),
	contentHtml: z.string().refine((html) => {
		const text = html
			.replace(/<[^>]*>/g, "")
			.replace(/&nbsp;/g, " ")
			.trim();
		return text.length > 0;
	}, "Isi artikel wajib diisi."),
	status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
