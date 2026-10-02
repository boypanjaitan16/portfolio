import { Alert, Button, Spin, Tag } from "antd";
import DOMPurify from "dompurify";
import { useNavigate, useParams } from "react-router-dom";
import { useArticle } from "../../hooks/useArticles";

export function ArticlePreviewPage() {
	const { articleId } = useParams();
	const navigate = useNavigate();
	const { data: article, isLoading, error } = useArticle(articleId);
	if (isLoading)
		return <Spin size="large" description="Loading preview…" fullscreen />;
	if (!article)
		return (
			<Alert
				type="error"
				showIcon
				title={error?.message ?? "Article not found."}
				className="m-10"
			/>
		);

	return (
		<main className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-10">
			<div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/20 pb-8">
				<div className="flex items-center gap-2">
					<Tag color={article.status === "PUBLISHED" ? "success" : "default"}>
						{article.status === "PUBLISHED" ? "Published" : "Draft"}
					</Tag>
					<Tag>{article.locale.toUpperCase()}</Tag>
				</div>
				<Button onClick={() => navigate(`/articles/${article.id}/edit`)}>
					Edit article
				</Button>
			</div>
			<article lang={article.locale}>
				<header className="py-12">
					<p className="section-kicker text-signal">{article.topic}</p>
					<h1 className="mt-6 text-5xl font-semibold tracking-tight md:text-7xl">
						{article.title}
					</h1>
					<p className="mt-6 max-w-3xl text-xl leading-8 text-muted">
						{article.summary}
					</p>
				</header>
				{article.cover && (
					<img
						src={article.cover.url}
						alt=""
						className="w-full max-h-[480px] object-cover"
					/>
				)}
				<div
					className="prose prose-lg my-12 max-w-5xl prose-headings:font-semibold"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: article HTML is sanitized with DOMPurify before rendering
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(article.contentHtml),
					}}
				/>
			</article>
		</main>
	);
}

export default ArticlePreviewPage;
