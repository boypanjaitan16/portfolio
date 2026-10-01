import type { Article } from "@portfolio/articles";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

type ArticleCardProps = {
	article: Article;
	index: number;
	headingLevel: "h2" | "h3";
};

export function ArticleCard({
	article,
	index,
	headingLevel: Heading,
}: ArticleCardProps) {
	return (
		<article className="group min-w-0 border border-ink/20 bg-paper">
			<Link
				to={`/notes/${article.slug}`}
				className="flex h-full flex-col transition-colors hover:bg-white/60"
			>
				<div className="aspect-video overflow-hidden bg-ink">
					{article.cover ? (
						<img
							src={article.cover.url}
							alt=""
							loading="lazy"
							decoding="async"
							className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
						/>
					) : (
						<div
							aria-hidden="true"
							data-testid="article-cover-placeholder"
							className="flex h-full items-end justify-end bg-ink p-5"
						>
							<span className="h-12 w-12 bg-signal sm:h-16 sm:w-16" />
						</div>
					)}
				</div>
				<div className="flex flex-1 flex-col p-5 sm:p-6">
					<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
						{article.topic} · {String(index + 1).padStart(2, "0")}
					</p>
					<Heading className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.025em] transition-colors group-hover:text-signal">
						{article.title}
					</Heading>
					<p className="mt-4 flex-1 leading-6 text-muted">{article.summary}</p>
					<ArrowUpRight
						className="mt-6 self-end transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
						aria-hidden="true"
					/>
				</div>
			</Link>
		</article>
	);
}
