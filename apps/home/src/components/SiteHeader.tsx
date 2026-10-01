import { Link, NavLink } from "react-router-dom";
import { useLocale } from "../i18n/LocaleProvider";

const linkClassName = ({ isActive }: { isActive: boolean }) =>
	`editorial-link py-2 ${isActive ? "text-signal" : ""}`;

export function SiteHeader() {
	const { content } = useLocale();

	return (
		<header className="sticky top-0 z-50 border-b border-ink/20 bg-paper">
			<div className="mx-auto max-w-[1440px] px-5 md:flex md:items-center md:justify-between md:px-10">
				<div className="flex items-center py-3 md:py-4">
					<Link
						to="/"
						className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.18em]"
					>
						<span className="grid h-9 w-9 place-items-center bg-signal text-white">
							{content.brand}
						</span>
						<span className="hidden sm:inline">Boy Boni Panjaitan</span>
					</Link>
				</div>

				<div className="flex items-center gap-6 border-t border-ink/15 md:border-0">
					<nav
						className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto py-1 font-mono text-[10px] uppercase tracking-[0.14em] md:gap-7 md:overflow-visible md:py-0 md:text-[11px]"
						aria-label={content.navigation.primaryLabel}
					>
						<NavLink className={linkClassName} to="/work">
							{content.navigation.work}
						</NavLink>
						<NavLink className={linkClassName} to="/about">
							{content.navigation.about}
						</NavLink>
						<NavLink className={linkClassName} to="/notes">
							{content.navigation.notes}
						</NavLink>
						<a className="editorial-link py-2" href="/tools/">
							{content.navigation.tools}
						</a>
					</nav>
				</div>
			</div>
		</header>
	);
}
