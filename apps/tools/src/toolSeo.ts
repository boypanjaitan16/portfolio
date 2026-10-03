import type { Locale } from "./toolsLocale";

/** Search and About-section copy for one tool in one language. */
export type ToolSeo = {
	/** Page title before the " | Boy Boni Panjaitan" suffix. */
	metaTitle: string;
	/** Meta description, about 150–160 characters. */
	metaDescription: string;
	about: string[];
	features: string[];
	steps: string[];
	faq: { question: string; answer: string }[];
};

export type ToolSeoCopy = Record<Locale, ToolSeo>;
