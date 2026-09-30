import { ArrowUpRight, Github } from "lucide-react";
import { useLocale } from "../i18n/LocaleProvider";

export function ContactBand() {
	const { content } = useLocale();

	return (
		<section className="bg-signal text-white" aria-labelledby="contact-title">
			<div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-12 md:px-10 md:py-20">
				<p className="font-mono text-[11px] uppercase tracking-[0.18em] md:col-span-3">
					{content.contact.label}
				</p>
				<div className="md:col-span-9">
					<h2
						id="contact-title"
						className="max-w-4xl text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-6xl"
					>
						{content.contact.title}
					</h2>
					<p className="mt-6 max-w-2xl leading-7 text-white/80">
						{content.contact.body}
					</p>
					<a
						className="mt-8 inline-flex items-center gap-3 border-b border-white pb-1 font-semibold"
						href="https://github.com/boypanjaitan16"
						target="_blank"
						rel="noreferrer"
					>
						<Github size={19} aria-hidden="true" />
						{content.contact.githubAction}
						<ArrowUpRight size={17} aria-hidden="true" />
					</a>
				</div>
			</div>
		</section>
	);
}
