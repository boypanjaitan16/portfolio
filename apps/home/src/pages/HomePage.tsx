import { ArrowDown, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { ArticleCard } from "../components/ArticleCard";
import { ContactBand } from "../components/ContactBand";
import { PageMeta } from "../components/PageMeta";
import { pageContent } from "../content/pageContent";
import { usePublishedArticles } from "../hooks/usePublishedArticles";
import { useLocale } from "../i18n/LocaleProvider";

export function HomePage() {
	const { content, locale } = useLocale();
	const pages = pageContent[locale];
	const {
		data: articles = [],
		isLoading: articlesLoading,
		error: articlesError,
	} = usePublishedArticles(locale);

	return (
		<main id="top">
			<PageMeta title="Software Engineer" description={content.hero.intro} />

			<section className="mx-auto grid min-h-[82vh] max-w-[1440px] grid-cols-1 border-b border-ink/20 md:grid-cols-12">
				<div className="flex flex-col justify-between border-b border-ink/20 px-5 py-10 md:col-span-7 md:border-b-0 md:border-r md:px-10 md:py-14 lg:col-span-8">
					<div className="page-reveal">
						<p className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
							<span className="h-px w-8 bg-signal" />
							{content.hero.eyebrow}
						</p>
						<h1 className="max-w-5xl font-display text-[clamp(3.7rem,8vw,8.8rem)] font-semibold leading-[0.88] tracking-[-0.065em]">
							Boy Boni <span className="block text-signal">Panjaitan.</span>
						</h1>
					</div>
					<div className="mt-16 grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
						<div>
							<h2 className="max-w-3xl text-2xl font-medium leading-tight tracking-[-0.025em] sm:text-3xl lg:text-4xl">
								{content.hero.statement}
							</h2>
							<p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
								{content.hero.intro}
							</p>
						</div>
						<a
							href="#work"
							className="group flex h-14 w-14 items-center justify-center rounded-full border border-ink transition hover:border-signal hover:bg-signal hover:text-white"
							aria-label={content.hero.primaryAction}
						>
							<ArrowDown
								className="transition group-hover:translate-y-1"
								aria-hidden="true"
							/>
						</a>
					</div>
				</div>

				<figure className="relative min-h-[520px] overflow-hidden bg-signal md:col-span-5 md:min-h-full lg:col-span-4">
					<img
						src="/images/red-building-danist-soh.webp"
						alt={content.images.redBuildingAlt}
						className="h-full w-full object-cover grayscale-[20%]"
						fetchPriority="high"
					/>
					<a
						className="absolute right-4 top-4 bg-ink px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white"
						href="https://unsplash.com/photos/yYn4zU-Hi_o"
						target="_blank"
						rel="noreferrer"
					>
						{content.footer.photoBy} · Danist Soh
					</a>
					<div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 to-transparent p-5 pt-24 text-white">
						<p className="max-w-44 font-mono text-[10px] uppercase leading-5 tracking-[0.16em]">
							{content.role}
						</p>
						<p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]">
							<MapPin size={13} aria-hidden="true" />
							{content.location}
						</p>
					</div>
				</figure>
			</section>

			<section
				id="work"
				className="mx-auto max-w-[1440px] border-b border-ink/20 px-5 py-20 md:px-10 md:py-28"
			>
				<div className="grid gap-10 md:grid-cols-12">
					<div className="md:col-span-4">
						<p className="section-kicker">{content.work.label}</p>
						<h2 className="mt-5 max-w-sm text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
							{content.work.title}
						</h2>
						<p className="mt-6 max-w-sm leading-7 text-muted">
							{content.work.intro}
						</p>
						<Link
							to="/work"
							className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-signal"
						>
							{pages.common.viewAllWork}
							<ArrowRight size={14} aria-hidden="true" />
						</Link>
					</div>
					<div className="border-t border-ink md:col-span-8">
						{content.work.projects.map((project) => (
							<article
								key={project.number}
								className="group grid gap-5 border-b border-ink/25 py-7 transition-colors hover:bg-white/50 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(12rem,0.7fr)_2rem] sm:items-start sm:px-3"
							>
								<p className="font-mono text-xs text-signal">
									{project.number}
								</p>
								<div>
									<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
										{content.work.conceptLabel} · {project.indexLabel}
									</p>
									<h3 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
										{project.title}
									</h3>
								</div>
								<div>
									<p className="leading-6 text-muted">{project.summary}</p>
									<p className="mt-4 font-mono text-[10px] uppercase leading-5 tracking-[0.12em]">
										{project.tags.join(" · ")}
									</p>
								</div>
								<ArrowUpRight
									className="transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-signal"
									aria-hidden="true"
								/>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="bg-ink text-white">
				<div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
					<div className="md:col-span-5">
						<p className="section-kicker text-signal">
							{content.approach.label}
						</p>
						<h2 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">
							{content.approach.title}
						</h2>
						<p className="mt-8 max-w-lg text-lg leading-8 text-white/60">
							{content.approach.intro}
						</p>
					</div>
					<div className="divide-y divide-white/20 border-t border-white/20 md:col-span-7">
						{content.approach.principles.map((principle) => (
							<article
								key={principle.number}
								className="grid gap-4 py-8 sm:grid-cols-[3rem_1fr]"
							>
								<span className="font-mono text-xs text-signal">
									{principle.number}
								</span>
								<div>
									<h3 className="text-2xl font-medium">{principle.title}</h3>
									<p className="mt-3 max-w-xl leading-7 text-white/55">
										{principle.description}
									</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
				<div className="flex flex-col justify-between gap-6 border-b border-ink pb-8 md:flex-row md:items-end">
					<div>
						<p className="section-kicker">{content.notes.label}</p>
						<h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
							{content.notes.title}
						</h2>
					</div>
					<div className="max-w-md">
						<p className="leading-7 text-muted">{content.notes.intro}</p>
						<Link
							to="/notes"
							className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-signal"
						>
							{pages.common.viewAllNotes}
							<ArrowRight size={14} aria-hidden="true" />
						</Link>
					</div>
				</div>
				<div
					className="grid gap-5 pt-7 md:grid-cols-3"
					data-prerender-ready={
						!articlesLoading && !articlesError ? "true" : undefined
					}
					data-prerender-error={articlesError ? "true" : undefined}
				>
					{articlesLoading && (
						<p className="py-7 text-muted">{pages.notes.loading}</p>
					)}
					{articlesError && (
						<p role="alert" className="py-7 text-signal">
							{pages.notes.error}
						</p>
					)}
					{!articlesLoading && !articlesError && articles.length === 0 && (
						<p className="py-7 text-muted">{pages.notes.empty}</p>
					)}
					{articles.slice(0, 3).map((article, index) => (
						<ArticleCard
							key={article.id}
							article={article}
							index={index}
							headingLevel="h3"
						/>
					))}
				</div>
			</section>

			<ContactBand />
		</main>
	);
}
