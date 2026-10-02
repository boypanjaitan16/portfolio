import { ArrowUpRight, FilePenLine, Github } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { pdfToolCard } from "./pdf/locale";
import { PdfEditorPage } from "./pdf/PdfEditorPage";
import { LocaleProvider, useToolsLocale } from "./toolsLocale";

const tools = [
	{
		path: "/pdf-editor",
		icon: FilePenLine,
		card: pdfToolCard,
	},
] as const;

function Layout({ children }: { children: ReactNode }) {
	const { locale, setLocale, t } = useToolsLocale();
	return (
		<div className="min-h-screen bg-paper text-ink">
			<header className="border-b border-ink/15">
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
						<a href="/" className="hover:text-primary">
							{t.portfolio}
						</a>
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
			{children}
		</div>
	);
}

function ToolsPage() {
	const { locale, t } = useToolsLocale();
	useEffect(() => {
		document.title = "Tools | Boy Boni Panjaitan";
	}, []);
	return (
		<Layout>
			<main className="mx-auto max-w-7xl px-5 pb-24 pt-16 md:px-10 md:pt-24">
				<p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary">
					{t.collection}
				</p>
				<h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
					{t.homeTitle}
				</h1>
				<p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
					{t.homeDescription}
				</p>
				<div className="mt-14 flex items-center justify-between border-b border-ink/20 pb-3 font-mono text-xs font-semibold uppercase tracking-[0.16em]">
					<h2>{t.availableTools}</h2>
					<span>{String(tools.length).padStart(2, "0")}</span>
				</div>
				<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{tools.map((tool, index) => {
						const Icon = tool.icon;
						return (
							<Link
								key={tool.path}
								to={tool.path}
								className="group flex min-h-72 flex-col border border-ink/20 bg-white p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							>
								<div className="flex items-start justify-between">
									<span className="grid h-14 w-14 place-items-center bg-primary/10 text-primary">
										<Icon size={27} strokeWidth={1.6} aria-hidden="true" />
									</span>
									<span className="font-mono text-xs text-muted">
										{String(index + 1).padStart(2, "0")}
									</span>
								</div>
								<h3 className="mt-10 text-2xl font-semibold">
									{tool.card[locale].name}
								</h3>
								<p className="mt-3 leading-relaxed text-muted">
									{tool.card[locale].description}
								</p>
								<span className="mt-auto flex items-center gap-2 pt-7 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
									{t.openTool}
									<ArrowUpRight size={17} aria-hidden="true" />
								</span>
							</Link>
						);
					})}
				</div>
			</main>
			<footer className="border-t border-ink/15 px-5 py-8 md:px-10">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-sm text-muted">
					<span>Boy Boni Panjaitan</span>
					<a
						href="https://github.com/boypanjaitan16"
						aria-label="GitHub"
						className="hover:text-primary"
					>
						<Github size={20} />
					</a>
				</div>
			</footer>
		</Layout>
	);
}

function NotFoundPage() {
	const { t } = useToolsLocale();
	return (
		<Layout>
			<main className="mx-auto max-w-7xl px-5 py-24 md:px-10">
				<h1 className="text-5xl font-semibold">{t.notFound}</h1>
				<Link className="mt-8 inline-block text-primary underline" to="/">
					{t.backToTools}
				</Link>
			</main>
		</Layout>
	);
}

export default function App() {
	return (
		<LocaleProvider>
			<Routes>
				<Route path="/" element={<ToolsPage />} />
				<Route
					path="/pdf-editor"
					element={
						<Layout>
							<PdfEditorPage />
						</Layout>
					}
				/>
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</LocaleProvider>
	);
}
