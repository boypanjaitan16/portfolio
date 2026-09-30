import { Github } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocale } from "../i18n/LocaleProvider";

export function SiteFooter() {
	const { content } = useLocale();

	return (
		<footer className="border-t border-ink/20 bg-paper px-5 py-8 md:px-10">
			<div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-12">
				<div className="md:col-span-5">
					<p className="font-semibold">Boy Boni Panjaitan</p>
					<p className="mt-2 max-w-sm text-sm leading-6 text-muted">
						{content.footer.summary}
					</p>
				</div>
				<nav
					className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.14em] md:col-span-4"
					aria-label={content.footer.footerNavigationLabel}
				>
					<Link className="editorial-link" to="/work">
						{content.navigation.work}
					</Link>
					<Link className="editorial-link" to="/about">
						{content.navigation.about}
					</Link>
					<Link className="editorial-link" to="/notes">
						{content.navigation.notes}
					</Link>
					<a className="editorial-link" href="/tools/">
						{content.navigation.tools}
					</a>
				</nav>
				<div className="flex items-start gap-5 md:col-span-3 md:justify-end">
					<a
						className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]"
						href="https://github.com/boypanjaitan16"
						target="_blank"
						rel="noreferrer"
					>
						<Github size={15} aria-hidden="true" />
						GitHub
					</a>
				</div>
			</div>
			<div className="mx-auto mt-10 flex max-w-[1440px] flex-col justify-between gap-3 border-t border-ink/15 pt-5 font-mono text-[9px] uppercase tracking-[0.13em] text-muted sm:flex-row">
				<span>{content.footer.siteNote}</span>
				<span>© {new Date().getFullYear()} Boy Boni Panjaitan</span>
			</div>
		</footer>
	);
}
