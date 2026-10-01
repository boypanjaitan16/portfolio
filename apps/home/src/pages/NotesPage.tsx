import { ArticleCard } from "../components/ArticleCard";
import { ContactBand } from "../components/ContactBand";
import { PageMeta } from "../components/PageMeta";
import { pageContent } from "../content/pageContent";
import { usePublishedArticles } from "../hooks/usePublishedArticles";
import { useLocale } from "../i18n/LocaleProvider";

export function NotesPage() {
	const { locale } = useLocale();
	const page = pageContent[locale].notes;
	const {
		data: articles = [],
		isLoading,
		error,
	} = usePublishedArticles(locale);

	return (
		<main>
			<PageMeta title={page.metaTitle} description={page.metaDescription} />
			<header className="mx-auto max-w-[1440px] border-b border-ink/20 px-5 py-16 md:px-10 md:py-24">
				<p className="section-kicker text-signal">{page.eyebrow}</p>
				<div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
					<h1 className="max-w-5xl text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-7xl md:col-span-8 md:text-8xl">
						{page.title}
					</h1>
					<p className="max-w-md text-lg leading-8 text-muted md:col-span-4">
						{page.intro}
					</p>
				</div>
			</header>
			<section
				className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24"
				data-prerender-ready={!isLoading && !error ? "true" : undefined}
				data-prerender-error={error ? "true" : undefined}
			>
				<div>
					{isLoading && <p className="py-8 text-muted">{page.loading}</p>}
					{error && (
						<p role="alert" className="py-8 text-signal">
							{page.error}
						</p>
					)}
					{!isLoading && !error && articles.length === 0 && (
						<p className="py-8 text-muted">{page.empty}</p>
					)}
					<div className="grid gap-5 pt-7 sm:grid-cols-2 md:grid-cols-3">
						{articles.map((article, index) => (
							<ArticleCard
								key={article.id}
								article={article}
								index={index}
								headingLevel="h2"
							/>
						))}
					</div>
				</div>
			</section>
			<ContactBand />
		</main>
	);
}
