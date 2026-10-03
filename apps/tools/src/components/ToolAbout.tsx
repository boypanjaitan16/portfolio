import { ChevronDown } from "lucide-react";
import type { ToolSeo } from "../toolSeo";
import { useToolsLocale } from "../toolsLocale";

const labelClassName =
	"font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary";

export function ToolAbout({ name, seo }: { name: string; seo: ToolSeo }) {
	const { t } = useToolsLocale();
	return (
		<section
			aria-labelledby="tool-about-title"
			className="mx-auto max-w-7xl px-5 pb-24 md:px-10"
		>
			<div className="border-t border-ink/15 pt-12">
				<h2
					id="tool-about-title"
					className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl"
				>
					{t.aboutTool.replace("{name}", name)}
				</h2>
				<div className="mt-5 max-w-3xl space-y-4 leading-7 text-muted">
					{seo.about.map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
				</div>
				<div className="mt-12 grid gap-10 md:grid-cols-2">
					<div>
						<h3 className={labelClassName}>{t.toolFeatures}</h3>
						<ul className="mt-4 space-y-3">
							{seo.features.map((feature) => (
								<li key={feature} className="flex gap-3 leading-relaxed">
									<span
										aria-hidden="true"
										className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-primary"
									/>
									{feature}
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3 className={labelClassName}>{t.howToUse}</h3>
						<ol className="mt-4 space-y-3">
							{seo.steps.map((step, index) => (
								<li key={step} className="flex gap-3 leading-relaxed">
									<span
										aria-hidden="true"
										className="font-mono text-sm font-semibold text-primary"
									>
										{String(index + 1).padStart(2, "0")}
									</span>
									{step}
								</li>
							))}
						</ol>
					</div>
				</div>
				<h3 className={`mt-14 ${labelClassName}`}>{t.faq}</h3>
				<div className="mt-4 border-t border-ink/15">
					{seo.faq.map((item) => (
						<details
							key={item.question}
							className="group border-b border-ink/15"
						>
							<summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
								{item.question}
								<ChevronDown
									size={18}
									aria-hidden="true"
									className="shrink-0 transition group-open:rotate-180"
								/>
							</summary>
							<p className="max-w-3xl pb-5 leading-7 text-muted">
								{item.answer}
							</p>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}
