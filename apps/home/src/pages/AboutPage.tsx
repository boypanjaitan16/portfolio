import { MapPin } from "lucide-react";
import { ContactBand } from "../components/ContactBand";
import { PageMeta } from "../components/PageMeta";
import { pageContent } from "../content/pageContent";
import { useLocale } from "../i18n/LocaleProvider";

export function AboutPage() {
	const { locale } = useLocale();
	const page = pageContent[locale].about;

	return (
		<main>
			<PageMeta title={page.metaTitle} description={page.metaDescription} />
			<header className="mx-auto max-w-[1440px] border-b border-ink/20 px-5 py-16 md:px-10 md:py-24">
				<p className="section-kicker text-signal">{page.eyebrow}</p>
				<h1 className="mt-8 max-w-6xl text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-7xl md:text-8xl">
					{page.title}
				</h1>
			</header>

			<section className="mx-auto grid max-w-[1440px] gap-12 border-b border-ink/20 px-5 py-16 md:grid-cols-12 md:px-10 md:py-24">
				<div className="md:col-span-4">
					<p className="max-w-sm text-2xl font-medium leading-9">
						{page.intro}
					</p>
				</div>
				<div className="space-y-7 text-lg leading-8 text-muted md:col-span-6 md:col-start-7">
					{page.biography.map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
				</div>
			</section>

			<section className="mx-auto max-w-[1440px] border-b border-ink/20 px-5 py-10 md:px-10">
				<div className="grid gap-6 bg-signal p-6 text-white md:grid-cols-12 md:p-8">
					<p className="font-mono text-[10px] uppercase tracking-[0.16em] md:col-span-2">
						{page.nowLabel}
					</p>
					<div className="md:col-span-4">
						<h2 className="flex items-center gap-3 text-2xl font-semibold">
							<MapPin size={20} aria-hidden="true" />
							{page.nowTitle}
						</h2>
					</div>
					<p className="max-w-xl leading-7 text-white/80 md:col-span-5 md:col-start-8">
						{page.nowBody}
					</p>
				</div>
			</section>

			<section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
				<div className="grid gap-12 md:grid-cols-12">
					<div className="md:col-span-4">
						<p className="section-kicker">{page.capabilitiesLabel}</p>
						<h2 className="mt-6 max-w-sm text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
							{page.capabilitiesTitle}
						</h2>
					</div>
					<div className="border-t border-ink md:col-span-8">
						{page.capabilities.map((capability, index) => (
							<article
								key={capability.title}
								className="grid gap-4 border-b border-ink/20 py-7 sm:grid-cols-[3rem_1fr_1fr]"
							>
								<span className="font-mono text-xs text-signal">
									0{index + 1}
								</span>
								<h3 className="text-2xl font-medium">{capability.title}</h3>
								<p className="leading-7 text-muted">{capability.description}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="bg-ink text-white">
				<div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-24">
					<p className="section-kicker text-signal">{page.stackLabel}</p>
					<h2 className="mt-6 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">
						{page.stackTitle}
					</h2>
					<div className="mt-14 grid border-t border-white/20 sm:grid-cols-2 lg:grid-cols-4">
						{page.stackGroups.map((group) => (
							<div
								key={group.label}
								className="border-b border-white/20 py-7 sm:border-r sm:px-6 sm:first:pl-0 lg:border-b-0"
							>
								<h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
									{group.label}
								</h3>
								<ul className="mt-6 space-y-3 text-lg">
									{group.items.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>
			<ContactBand />
		</main>
	);
}
