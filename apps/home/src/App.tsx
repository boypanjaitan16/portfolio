import { Link, Route, Routes } from "react-router-dom";

function HomePage() {
	return (
		<main className="flex min-h-screen items-center bg-mist px-6 py-16 text-ink">
			<section className="mx-auto w-full max-w-3xl rounded-3xl border border-sand bg-white p-8 shadow-soft sm:p-12">
				<p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
					Portfolio
				</p>
				<h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-6xl">
					Boy Boni Panjaitan
				</h1>
				<p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
					A focused home for my work, ideas, and the practical tools I build.
				</p>
				<Link
					className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
					to="/tools/"
				>
					Explore tools
				</Link>
			</section>
		</main>
	);
}

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
		</Routes>
	);
}
