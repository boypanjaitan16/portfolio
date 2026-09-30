import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { getArticle } from "../content/articles";
import { pageContent } from "../content/pageContent";
import { useLocale } from "../i18n/LocaleProvider";
import { NotFoundPage } from "./NotFoundPage";

export function ArticlePage() {
	const { slug } = useParams();
	const { locale } = useLocale();
	const content = pageContent[locale];
	const article = getArticle(slug, locale);

	if (!article) return <NotFoundPage />;

	return (
		<main>
			<PageMeta title={article.title} description={article.description} />
			<article className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
				<Link
					to="/notes"
					className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-signal"
				>
					<ArrowLeft size={14} aria-hidden="true" />
					{content.common.backToNotes}
				</Link>

				<header className="mt-12 grid gap-8 border-b border-ink/20 pb-14 md:grid-cols-12">
					<div className="md:col-span-8">
						<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
							{content.article.plannedLabel} · {article.topic}
						</p>
						<h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
							{article.title}
						</h1>
					</div>
					<p className="max-w-md text-lg leading-8 text-muted md:col-span-4 md:self-end">
						{article.description}
					</p>
				</header>

				<div className="grid gap-12 py-14 md:grid-cols-12 md:py-20">
					<section className="bg-signal p-7 text-white md:col-span-5 md:p-10">
						<p className="font-mono text-[10px] uppercase tracking-[0.16em]">
							{content.article.plannedLabel}
						</p>
						<h2 className="mt-8 text-4xl font-semibold leading-none tracking-[-0.04em]">
							{content.article.plannedTitle}
						</h2>
						<p className="mt-6 leading-7 text-white/80">
							{content.article.plannedBody}
						</p>
					</section>

					<section className="md:col-span-6 md:col-start-7">
						<p className="section-kicker">{content.article.outlineLabel}</p>
						<ol className="mt-8 border-t border-ink">
							{article.outline.map((item, index) => (
								<li
									key={item}
									className="grid grid-cols-[3rem_1fr] gap-4 border-b border-ink/20 py-6"
								>
									<span className="font-mono text-xs text-signal">
										0{index + 1}
									</span>
									<span className="text-xl font-medium">{item}</span>
								</li>
							))}
						</ol>
					</section>
				</div>
			</article>
		</main>
	);
}
