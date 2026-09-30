import type { Locale } from "./portfolioContent";

export type ArticleStatus = "planned";

type ArticleCopy = {
	title: string;
	description: string;
	topic: string;
	outline: string[];
};

type ArticleRecord = {
	slug: string;
	number: string;
	status: ArticleStatus;
	copy: Record<Locale, ArticleCopy>;
};

export type LocalizedArticle = ArticleCopy & {
	slug: string;
	number: string;
	status: ArticleStatus;
};

const articles: ArticleRecord[] = [
	{
		slug: "interfaces-should-explain-themselves",
		number: "01",
		status: "planned",
		copy: {
			en: {
				title: "Interfaces should explain themselves",
				description:
					"What operational tools can learn from maps, labels, and good wayfinding.",
				topic: "Interface design",
				outline: [
					"Why hidden system state creates avoidable cognitive load",
					"Using hierarchy and labels as operational wayfinding",
					"A practical checklist for self-explanatory interfaces",
				],
			},
			id: {
				title: "Antarmuka seharusnya mampu menjelaskan dirinya",
				description:
					"Pelajaran dari peta, label, dan wayfinding untuk tools operasional.",
				topic: "Desain antarmuka",
				outline: [
					"Mengapa state sistem yang tersembunyi menambah beban kognitif",
					"Menggunakan hierarki dan label sebagai wayfinding operasional",
					"Checklist praktis untuk antarmuka yang mudah dipahami",
				],
			},
		},
	},
	{
		slug: "designing-for-failure-without-fear",
		number: "02",
		status: "planned",
		copy: {
			en: {
				title: "Designing for failure without designing for fear",
				description:
					"How calm defaults and explicit states help teams respond under pressure.",
				topic: "Reliability",
				outline: [
					"Separating urgency from visual noise",
					"Making recovery paths visible before they are needed",
					"Design details that support good incident decisions",
				],
			},
			id: {
				title: "Merancang untuk kegagalan tanpa merancang ketakutan",
				description:
					"Bagaimana default yang tenang dan state eksplisit membantu tim bekerja di bawah tekanan.",
				topic: "Reliability",
				outline: [
					"Memisahkan urgensi dari kebisingan visual",
					"Menampilkan jalur pemulihan sebelum dibutuhkan",
					"Detail desain yang mendukung keputusan insiden",
				],
			},
		},
	},
	{
		slug: "small-tools-long-shelf-life",
		number: "03",
		status: "planned",
		copy: {
			en: {
				title: "Small tools, long shelf life",
				description:
					"A case for narrow software that stays useful after the launch energy fades.",
				topic: "Product engineering",
				outline: [
					"Choosing a narrow problem boundary",
					"Why maintenance cost is part of product design",
					"Signals that a small tool has earned its place",
				],
			},
			id: {
				title: "Tools kecil, usia pakai panjang",
				description:
					"Tentang software yang sempit fokusnya tetapi tetap berguna setelah euforia peluncuran hilang.",
				topic: "Product engineering",
				outline: [
					"Memilih batas masalah yang sempit",
					"Mengapa biaya perawatan adalah bagian dari desain produk",
					"Tanda bahwa sebuah tool kecil layak dipertahankan",
				],
			},
		},
	},
];

export function getArticles(locale: Locale): LocalizedArticle[] {
	return articles.map(({ copy, ...article }) => ({
		...article,
		...copy[locale],
	}));
}

export function getArticle(
	slug: string | undefined,
	locale: Locale,
): LocalizedArticle | undefined {
	return getArticles(locale).find((article) => article.slug === slug);
}
