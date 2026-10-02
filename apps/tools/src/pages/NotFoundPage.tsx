import { Link } from "react-router-dom";
import { useToolsLocale } from "../toolsLocale";

export function NotFoundPage() {
	const { t } = useToolsLocale();
	return (
		<main className="mx-auto max-w-7xl px-5 py-24 md:px-10">
			<h1 className="text-5xl font-semibold">{t.notFound}</h1>
			<Link className="mt-8 inline-block text-primary underline" to="/">
				{t.backToTools}
			</Link>
		</main>
	);
}
