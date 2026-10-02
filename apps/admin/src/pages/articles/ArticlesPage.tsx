import type { Article, ArticleStatus } from "@portfolio/articles";
import { Alert, Button, Popconfirm, Segmented, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	useArticles,
	useDeleteArticle,
	useSaveArticle,
} from "../../hooks/useArticles";

type Filter = "ALL" | ArticleStatus;
type Feedback = { message: string; type: "success" | "error" };

export function ArticlesPage() {
	const { data = [], isLoading, error } = useArticles();
	const save = useSaveArticle();
	const remove = useDeleteArticle();
	const navigate = useNavigate();
	const [feedback, setFeedback] = useState<Feedback | null>(null);
	const [filter, setFilter] = useState<Filter>("ALL");

	const toggle = async (article: Article) => {
		try {
			const nextStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
			await save.mutateAsync({
				values: {
					locale: article.locale,
					title: article.title,
					slug: article.slug,
					summary: article.summary,
					topic: article.topic,
					contentHtml: article.contentHtml,
					status: nextStatus,
				},
				previous: article,
				pendingImages: [],
				coverFile: null,
				removeCover: false,
			});
			setFeedback({
				type: "success",
				message:
					nextStatus === "PUBLISHED"
						? "Article published. Deploy Pages to update the HTML and sitemap."
						: "Article moved to draft. Deploy Pages to update the HTML and sitemap.",
			});
		} catch (reason) {
			setFeedback({
				type: "error",
				message:
					reason instanceof Error
						? reason.message
						: "Could not change the article status.",
			});
		}
	};

	const handleDelete = async (article: Article) => {
		try {
			const result = await remove.mutateAsync(article);
			setFeedback({
				type: result.cleanupFailed ? "error" : "success",
				message: result.cleanupFailed
					? "Article deleted, but some media could not be removed."
					: "Article deleted. Deploy Pages to update the HTML and sitemap.",
			});
		} catch (reason) {
			setFeedback({
				type: "error",
				message:
					reason instanceof Error
						? reason.message
						: "Could not delete the article.",
			});
		}
	};

	const columns: ColumnsType<Article> = [
		{
			title: "Article",
			key: "article",
			width: 390,
			render: (_, article) => (
				<div className="flex min-w-64 items-start gap-4">
					{article.cover ? (
						<img
							src={article.cover.url}
							alt=""
							className="h-20 w-20 shrink-0 object-cover"
						/>
					) : (
						<div className="grid h-20 w-20 shrink-0 place-items-center bg-line text-center text-xs text-muted">
							No cover
						</div>
					)}
					<div>
						<p className="font-semibold text-ink">{article.title}</p>
						<p className="mt-1 line-clamp-2 text-sm text-muted">
							{article.summary}
						</p>
					</div>
				</div>
			),
		},
		{
			title: "Language / topic",
			key: "locale",
			width: 170,
			render: (_, article) => (
				<span>
					{article.locale.toUpperCase()} · {article.topic}
				</span>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			width: 110,
			render: (status: ArticleStatus) => (
				<Tag color={status === "PUBLISHED" ? "success" : "default"}>
					{status === "PUBLISHED" ? "Published" : "Draft"}
				</Tag>
			),
		},
		{
			title: "Updated",
			dataIndex: "updatedAt",
			width: 135,
			render: (value: string) =>
				value ? new Date(value).toLocaleDateString("en-US") : "—",
		},
		{
			title: "Actions",
			key: "actions",
			width: 285,
			render: (_, article) => (
				<div className="flex flex-wrap items-center gap-1">
					<Button
						type="link"
						onClick={() => navigate(`/articles/${article.id}/preview`)}
					>
						Preview
					</Button>
					<Button
						type="link"
						onClick={() => navigate(`/articles/${article.id}/edit`)}
					>
						Edit
					</Button>
					<Button
						type="link"
						loading={save.isPending}
						onClick={() => void toggle(article)}
					>
						{article.status === "PUBLISHED" ? "Move to draft" : "Publish"}
					</Button>
					<Popconfirm
						title={`Delete article ${article.title}?`}
						okText="Delete"
						cancelText="Cancel"
						okButtonProps={{ danger: true, loading: remove.isPending }}
						onConfirm={() => void handleDelete(article)}
					>
						<Button
							type="link"
							danger
							aria-label={`Delete ${article.title}`}
							disabled={remove.isPending}
						>
							Delete
						</Button>
					</Popconfirm>
				</div>
			),
		},
	];

	return (
		<main className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-10">
			<div className="flex flex-wrap items-end justify-between gap-5 border-b border-ink pb-8">
				<div>
					<p className="section-kicker text-signal">Content</p>
					<h1 className="mt-5 text-5xl font-semibold tracking-tight">
						Articles
					</h1>
					<p className="mt-3 text-muted">
						Write, preview, and publish articles.
					</p>
				</div>
				<Button
					type="primary"
					icon={<Plus size={18} />}
					onClick={() => navigate("/articles/new")}
				>
					New article
				</Button>
			</div>
			<div className="mt-6">
				<Segmented
					aria-label="Filter article status"
					value={filter}
					onChange={(value) => setFilter(value as Filter)}
					options={[
						{ value: "ALL", label: "All" },
						{ value: "DRAFT", label: "Draft" },
						{ value: "PUBLISHED", label: "Published" },
					]}
				/>
			</div>
			{feedback && (
				<Alert
					type={feedback.type}
					showIcon
					title={feedback.message}
					className="mt-5"
				/>
			)}
			{error && (
				<Alert type="error" showIcon title={error.message} className="mt-5" />
			)}
			<div className="mt-6">
				<Table<Article>
					rowKey="id"
					columns={columns}
					dataSource={data.filter(
						(article) => filter === "ALL" || article.status === filter,
					)}
					loading={isLoading}
					pagination={{ pageSize: 10, showSizeChanger: false }}
					scroll={{ x: 1090 }}
					locale={{ emptyText: "No articles yet." }}
				/>
			</div>
		</main>
	);
}

export default ArticlesPage;
