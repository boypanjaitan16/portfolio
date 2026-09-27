import { Route, Routes } from "react-router-dom";

function ToolsPage() {
	return (
		<main className="flex min-h-screen items-center bg-ink px-6 py-16 text-white">
			<section className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-soft sm:p-12">
				<p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
					Boy's tools
				</p>
				<h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-6xl">
					Useful tools, thoughtfully made.
				</h1>
				<p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
					This is the starting point for small, useful web tools. New tools will
					appear here.
				</p>
				<a
					className="mt-8 inline-flex rounded-full border border-slate-500 px-5 py-3 font-semibold transition hover:border-white hover:bg-white hover:text-ink"
					href="/"
				>
					Back to portfolio
				</a>
			</section>
		</main>
	);
}

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<ToolsPage />} />
		</Routes>
	);
}
