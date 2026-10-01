import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
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
				className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-12 md:px-10 md:py-24"
				data-prerender-ready={!isLoading && !error ? "true" : undefined}
				data-prerender-error={error ? "true" : undefined}
			>
				<aside className="md:col-span-3">
					<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
						{page.queueLabel}
					</p>
					<p className="mt-5 max-w-xs leading-7 text-muted">
						{page.queueSummary}
					</p>
					<p className="mt-8 font-mono text-4xl font-semibold text-signal">
						{String(articles.length).padStart(2, "0")}
					</p>
				</aside>
				<div className="border-t border-ink md:col-span-9">
					{isLoading && <p className="py-8 text-muted">{page.loading}</p>}
					{error && (
						<p role="alert" className="py-8 text-signal">
							{page.error}
						</p>
					)}
					{!isLoading && !error && articles.length === 0 && (
						<p className="py-8 text-muted">{page.empty}</p>
					)}
					{articles.map((article, index) => (
						<article
							key={article.id}
							className="group border-b border-ink/20 py-8"
						>
							<Link
								to={`/notes/${article.slug}`}
								className="grid gap-6 md:grid-cols-[3rem_minmax(0,1fr)_minmax(12rem,0.55fr)_2rem] md:items-start"
							>
								<span className="font-mono text-xs text-signal">
									{String(index + 1).padStart(2, "0")}
								</span>
								<div>
									<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
										{article.topic}
									</p>
									<h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] transition group-hover:text-signal sm:text-4xl">
										{article.title}
									</h2>
								</div>
								<p className="leading-7 text-muted">{article.summary}</p>
								<ArrowRight
									className="transition group-hover:translate-x-1 group-hover:text-signal"
									aria-label={page.openArticle}
								/>
							</Link>
						</article>
					))}
				</div>
			</section>
			<ContactBand />
		</main>
	);
}
