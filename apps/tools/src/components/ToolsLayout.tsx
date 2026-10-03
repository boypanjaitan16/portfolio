import { Home } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { useToolsLocale } from "../toolsLocale";

export function ToolsLayout() {
	const { locale, setLocale, t } = useToolsLocale();
	return (
		<div className="flex min-h-screen flex-col bg-paper text-ink">
			<header className="sticky top-0 z-40 border-b border-ink/15 bg-paper">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-10">
					<Link
						to="/"
						className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.16em]"
					>
						<span className="grid h-9 w-9 place-items-center bg-primary text-white">
							BB
						</span>
						<span>Boy&apos;s tools</span>
					</Link>
					<div className="flex items-center gap-5 font-mono text-xs font-semibold uppercase tracking-wider">
						<fieldset
							aria-label={t.language}
							className="flex gap-1 border border-ink/25 p-1"
						>
							{(["en", "id"] as const).map((value) => (
								<button
									key={value}
									type="button"
									aria-pressed={locale === value}
									onClick={() => setLocale(value)}
									className={`px-2 py-1 ${locale === value ? "bg-ink text-white" : "hover:bg-ink/10"}`}
								>
									{value.toUpperCase()}
								</button>
							))}
						</fieldset>
					</div>
				</div>
			</header>
			<div className="flex-1">
				<Outlet />
			</div>
			<footer className="border-t border-ink/15">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-8 text-sm text-muted md:px-10">
					<nav
						aria-label={t.footerNavigation}
						className="flex flex-wrap items-center gap-x-6 gap-y-3"
					>
						<Link to="/privacy-policy" className="hover:text-primary">
							{t.privacyPolicy}
						</Link>
						<Link to="/terms-of-service" className="hover:text-primary">
							{t.termsOfService}
						</Link>
					</nav>
					<a href="/" aria-label="GitHub" className="hover:text-primary">
						<Home size={20} />
					</a>
				</div>
			</footer>
		</div>
	);
}
