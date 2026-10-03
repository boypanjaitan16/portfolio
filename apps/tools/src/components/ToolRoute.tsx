import { Suspense, useMemo } from "react";
import type { Tool } from "../toolCatalog";
import { useToolsLocale } from "../toolsLocale";
import { canonicalUrl, ogImageUrl, PageMeta } from "./PageMeta";
import { ToolAbout } from "./ToolAbout";

/** Renders a lazily loaded tool page with its meta tags and About section. */
export function ToolRoute({ tool }: { tool: Tool }) {
	const { locale } = useToolsLocale();
	const seo = tool.seo[locale];
	const { name } = tool.card[locale];
	const jsonLd = useMemo(() => {
		const url = canonicalUrl(`/${tool.slug}`);
		return {
			"@context": "https://schema.org",
			"@graph": [
				{
					"@type": "WebApplication",
					name,
					description: seo.metaDescription,
					url,
					image: ogImageUrl(tool.slug),
					applicationCategory: "UtilitiesApplication",
					operatingSystem: "Any",
					browserRequirements: "Requires JavaScript",
					inLanguage: locale,
					isAccessibleForFree: true,
					offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
					featureList: seo.features,
					author: {
						"@type": "Person",
						name: "Boy Boni Panjaitan",
						url: "https://boypanjaitan.com/",
					},
				},
				{
					"@type": "FAQPage",
					url,
					mainEntity: seo.faq.map((item) => ({
						"@type": "Question",
						name: item.question,
						acceptedAnswer: { "@type": "Answer", text: item.answer },
					})),
				},
			],
		};
	}, [locale, name, seo, tool.slug]);
	const Page = tool.page.Page;
	return (
		<>
			<PageMeta
				title={`${seo.metaTitle} | Boy Boni Panjaitan`}
				description={seo.metaDescription}
				image={ogImageUrl(tool.slug)}
				imageAlt={name}
				jsonLd={jsonLd}
			/>
			<Suspense fallback={<LazyPageFallback />}>
				<Page />
				<ToolAbout name={name} seo={seo} />
			</Suspense>
		</>
	);
}

function LazyPageFallback() {
	const { t } = useToolsLocale();
	return (
		<main className="mx-auto max-w-7xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
			<p role="status" className="text-sm text-muted">
				{t.loading}
			</p>
		</main>
	);
}
