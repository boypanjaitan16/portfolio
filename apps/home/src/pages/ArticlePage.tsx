import type { ArticleLocale } from "@portfolio/articles";
import DOMPurify from "dompurify";
import { Link, useParams } from "react-router-dom";
import { ArticleShare } from "../components/ArticleShare";
import { PageMeta } from "../components/PageMeta";
import { pageContent } from "../content/pageContent";
import { usePublishedArticle } from "../hooks/usePublishedArticles";
import { useLocale } from "../i18n/LocaleProvider";
import { NotFoundPage } from "./NotFoundPage";

function formatPublishedDate(value: string | null, locale: ArticleLocale) {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
		dateStyle: "long",
		timeZone: "UTC",
	}).format(date);
}

export function ArticlePage() {
	const { slug } = useParams();
	const { content: siteContent, locale } = useLocale();
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

	const publishedDate = formatPublishedDate(
		article.publishedAt,
		article.locale,
	);

	return (
		<main data-prerender-ready="true">
			<PageMeta
				title={article.title}
				description={article.summary}
				image={article.cover?.url}
				kind="article"
				publishedAt={publishedDate ? article.publishedAt : null}
			/>
			<article
				lang={article.locale}
				className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20"
			>
				<nav
					aria-label={content.common.breadcrumbLabel}
					lang={locale}
					className="font-mono text-[10px] uppercase tracking-[0.14em]"
				>
					<ol className="flex min-w-0 items-center gap-2">
						<li>
							<Link className="editorial-link text-signal" to="/">
								{content.common.home}
							</Link>
						</li>
						<li aria-hidden="true" className="text-muted">
							/
						</li>
						<li>
							<Link className="editorial-link text-signal" to="/notes">
								{siteContent.navigation.notes}
							</Link>
						</li>
						<li aria-hidden="true" className="text-muted">
							/
						</li>
						<li aria-current="page" className="min-w-0 truncate text-muted">
							<span lang={article.locale}>{article.title}</span>
						</li>
					</ol>
				</nav>
				<header className="grid gap-8 pb-10">
					<h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
						{article.title}
					</h1>
				</header>
				<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
					{article.topic} · {article.locale.toUpperCase()}
					{publishedDate && (
						<>
							{" · "}
							<time dateTime={article.publishedAt ?? undefined}>
								{publishedDate}
							</time>
						</>
					)}
				</p>
				<p className="max-w-md text-lg leading-8 text-muted mt-5">
					{article.summary}
				</p>
				{article.cover && (
					<img
						src={article.cover.url}
						alt=""
						className="mt-12 max-h-[580px] w-full object-cover"
					/>
				)}
				<div className="mx-auto my-14 flex flex-col md:flex-row max-w-5xl gap-8 lg:justify-center lg:gap-12">
					<ArticleShare
						key={article.id}
						title={article.title}
						locale={locale}
					/>
					<div
						className="prose prose-lg min-w-0 max-w-3xl prose-headings:font-semibold prose-a:text-signal"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: article HTML is sanitized with DOMPurify before rendering
						dangerouslySetInnerHTML={{
							__html: DOMPurify.sanitize(article.contentHtml),
						}}
					/>
				</div>
			</article>
		</main>
	);
}
