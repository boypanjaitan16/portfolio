import DOMPurify from "dompurify";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { pageContent } from "../content/pageContent";
import { usePublishedArticle } from "../hooks/usePublishedArticles";
import { useLocale } from "../i18n/LocaleProvider";
import { NotFoundPage } from "./NotFoundPage";

export function ArticlePage() {
	const { slug } = useParams();
	const { locale } = useLocale();
	const content = pageContent[locale];
	const { data: article, isLoading, error } = usePublishedArticle(slug);

	if (isLoading)
		return (
			<main className="mx-auto max-w-[1440px] px-5 py-20">
				{content.notes.loading}
			</main>
		);
	if (error)
		return (
			<main
				role="alert"
				data-prerender-error="true"
				className="mx-auto max-w-[1440px] px-5 py-20 text-signal"
			>
				{content.notes.error}
			</main>
		);
	if (!article) return <NotFoundPage />;

	return (
		<main data-prerender-ready="true">
			<PageMeta
				title={article.title}
				description={article.summary}
				image={article.cover?.url}
				lang={article.locale}
			/>
			<article
				lang={article.locale}
				className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20"
			>
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
							{article.topic} · {article.locale.toUpperCase()}
						</p>
						<h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
							{article.title}
						</h1>
					</div>
					<p className="max-w-md text-lg leading-8 text-muted md:col-span-4 md:self-end">
						{article.summary}
					</p>
				</header>
				{article.cover && (
					<img
						src={article.cover.url}
						alt=""
						className="mt-12 max-h-[580px] w-full object-cover"
					/>
				)}
				<div
					className="prose prose-lg mx-auto my-14 max-w-3xl prose-headings:font-semibold prose-a:text-signal"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: article HTML is sanitized with DOMPurify before rendering
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(article.contentHtml),
					}}
				/>
			</article>
		</main>
	);
}
