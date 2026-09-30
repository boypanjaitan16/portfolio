import { ArrowUpRight } from "lucide-react";
import { ContactBand } from "../components/ContactBand";
import { PageMeta } from "../components/PageMeta";
import { pageContent } from "../content/pageContent";
import { useLocale } from "../i18n/LocaleProvider";

export function WorkPage() {
	const { content, locale } = useLocale();
	const page = pageContent[locale].work;

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

			<section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
				<div className="border-t border-ink">
					{content.work.projects.map((project) => (
						<article
							key={project.number}
							className="group grid gap-6 border-b border-ink/25 py-9 md:grid-cols-[4rem_minmax(0,1.1fr)_minmax(18rem,0.9fr)_2rem] md:items-start"
						>
							<p className="font-mono text-xs text-signal">{project.number}</p>
							<div>
								<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
									{content.work.conceptLabel} · {project.indexLabel}
								</p>
								<h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
									{project.title}
								</h2>
							</div>
							<div>
								<p className="leading-7 text-muted">{project.summary}</p>
								<p className="mt-5 font-mono text-[10px] uppercase leading-5 tracking-[0.13em]">
									{project.tags.join(" · ")}
								</p>
							</div>
							<ArrowUpRight
								className="text-muted transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-signal"
								aria-hidden="true"
							/>
						</article>
					))}
				</div>
			</section>

			<section className="bg-ink text-white">
				<div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
					<p className="section-kicker text-signal">{page.frameworkLabel}</p>
					<h2 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">
						{page.frameworkTitle}
					</h2>
					<div className="mt-14 grid border-t border-white/20 md:grid-cols-4">
						{page.frameworkItems.map((item, index) => (
							<article
								key={item.title}
								className="border-b border-white/20 py-7 md:border-b-0 md:border-r md:px-6 first:pl-0 last:border-r-0 last:pr-0"
							>
								<p className="font-mono text-[10px] text-signal">
									0{index + 1}
								</p>
								<h3 className="mt-6 text-2xl font-medium">{item.title}</h3>
								<p className="mt-3 leading-7 text-white/55">
									{item.description}
								</p>
							</article>
						))}
					</div>
				</div>
			</section>
			<ContactBand />
		</main>
	);
}
