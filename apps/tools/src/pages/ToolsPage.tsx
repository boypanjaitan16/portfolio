import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { canonicalUrl, ogImageUrl, PageMeta } from "../components/PageMeta";
import { tools } from "../toolCatalog";
import { useToolsLocale } from "../toolsLocale";

export function ToolsPage() {
	const { locale, t } = useToolsLocale();
	const jsonLd = useMemo(
		() => ({
			"@context": "https://schema.org",
			"@type": "CollectionPage",
			name: t.metaTitle,
			description: t.metaDescription,
			url: canonicalUrl("/"),
			inLanguage: locale,
			mainEntity: {
				"@type": "ItemList",
				itemListElement: tools.map((tool, index) => ({
					"@type": "ListItem",
					position: index + 1,
					name: tool.card[locale].name,
					url: canonicalUrl(`/${tool.slug}`),
				})),
			},
		}),
		[locale, t.metaDescription, t.metaTitle],
	);
	return (
		<main className="mx-auto max-w-7xl px-5 pb-24 pt-16 md:px-10 md:pt-24">
			<PageMeta
				title={`${t.metaTitle} | Boy Boni Panjaitan`}
				description={t.metaDescription}
				image={ogImageUrl("tools")}
				imageAlt={t.homeTitle}
				jsonLd={jsonLd}
			/>
			<h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
				{t.homeTitle}
			</h1>
			<p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
				{t.homeDescription}
			</p>
			<div className="mt-14 flex items-center justify-between border-b border-ink/20 pb-3 font-mono text-xs font-semibold uppercase tracking-[0.16em]">
				<h2>{t.availableTools}</h2>
				<span>{String(tools.length).padStart(2, "0")}</span>
			</div>
			<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{tools.map((tool, index) => {
					const Icon = tool.icon;
					return (
						<Link
							key={tool.slug}
							to={`/${tool.slug}`}
							onPointerEnter={() => void tool.page.preload().catch(() => {})}
							onFocus={() => void tool.page.preload().catch(() => {})}
							className="group flex min-h-72 flex-col border border-ink/20 bg-white p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						>
							<div className="flex items-start justify-between">
								<span className="grid h-14 w-14 place-items-center bg-primary/10 text-primary">
									<Icon size={27} strokeWidth={1.6} aria-hidden="true" />
								</span>
								<span className="font-mono text-xs text-muted">
									{String(index + 1).padStart(2, "0")}
								</span>
							</div>
							<h3 className="mt-10 text-2xl font-semibold">
								{tool.card[locale].name}
							</h3>
							<p className="mt-3 leading-relaxed text-muted">
								{tool.card[locale].description}
							</p>
							<span className="mt-auto flex items-center gap-2 pt-7 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
								{t.openTool}
								<ArrowUpRight size={17} aria-hidden="true" />
							</span>
						</Link>
					);
				})}
			</div>
		</main>
	);
}
