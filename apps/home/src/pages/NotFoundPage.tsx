import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { pageContent } from "../content/pageContent";
import { useLocale } from "../i18n/LocaleProvider";

export function NotFoundPage() {
	const { locale } = useLocale();
	const content = pageContent[locale];
	const page = content.notFound;

	return (
		<main className="mx-auto flex min-h-[65vh] max-w-[1440px] items-center px-5 py-20 md:px-10">
			<PageMeta title={page.metaTitle} description={page.metaDescription} />
			<div>
				<p className="section-kicker text-signal">{page.label}</p>
				<h1 className="mt-8 max-w-4xl text-6xl font-semibold leading-[0.9] tracking-[-0.06em] sm:text-8xl">
					{page.title}
				</h1>
				<p className="mt-8 max-w-xl text-lg leading-8 text-muted">
					{page.body}
				</p>
				<Link
					to="/"
					className="mt-10 inline-flex items-center gap-2 border-b border-ink pb-1 font-semibold"
				>
					<ArrowLeft size={17} aria-hidden="true" />
					{content.common.backHome}
				</Link>
			</div>
		</main>
	);
}
