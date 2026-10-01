import { socialLinks } from "@portfolio/config";
import { Facebook, Github, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocale } from "../i18n/LocaleProvider";
import { LocaleToggle } from "./LocaleToggle";

const socialProfiles = [
	{ label: "Instagram", href: socialLinks.instagram, Icon: Instagram },
	{ label: "Facebook", href: socialLinks.facebook, Icon: Facebook },
	{ label: "GitHub", href: socialLinks.github, Icon: Github },
];

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
				<nav
					className="flex flex-wrap items-start gap-x-5 gap-y-3 md:col-span-3 md:justify-end"
					aria-label={content.footer.socialNavigationLabel}
				>
					{socialProfiles.map(({ label, href, Icon }) => (
						<a
							key={label}
							className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] hover:text-signal"
							href={href}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon size={15} aria-hidden="true" />
							{label}
						</a>
					))}
				</nav>
			</div>
			<div className="mx-auto mt-10 flex max-w-[1440px] flex-col justify-between gap-3 border-t border-ink/15 pt-5 font-mono text-[9px] uppercase tracking-[0.13em] text-muted sm:flex-row sm:items-center">
				<span>{content.footer.siteNote}</span>
				<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
					<LocaleToggle tone="paper" />
					<span>© {new Date().getFullYear()} Boy Boni Panjaitan</span>
				</div>
			</div>
		</footer>
	);
}
