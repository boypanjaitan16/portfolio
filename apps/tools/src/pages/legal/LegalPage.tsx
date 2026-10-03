import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ogImageUrl, PageMeta } from "../../components/PageMeta";
import { useToolsLocale } from "../../toolsLocale";
import { legalCopy } from "./locale";

type LegalKind = "privacy" | "terms";

function LegalSection({
	number,
	title,
	children,
}: {
	number: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="grid gap-3 border-t border-ink/15 py-7 sm:grid-cols-[3rem_1fr] sm:gap-5">
			<span className="pt-1 font-mono text-xs text-primary" aria-hidden="true">
				{number}
			</span>
			<div>
				<h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
				<div className="mt-3 leading-7 text-muted">{children}</div>
			</div>
		</section>
	);
}

const linkClassName =
	"font-semibold text-primary underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function LegalPage({ kind }: { kind: LegalKind }) {
	const { locale } = useToolsLocale();
	const copy = legalCopy[locale];
	const page = copy[kind];
	return (
		<main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-12 md:px-10 md:pb-28 md:pt-20">
			<PageMeta
				title={`${page.title} | Boy's Tools`}
				description={page.intro}
				image={ogImageUrl("tools")}
			/>
			<div className="max-w-3xl">
				<h1 className="mt-4 font-display text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
					{page.title}
				</h1>
				<p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
					{page.intro}
				</p>
				<div className="mt-12">
					{kind === "privacy" ? (
						<>
							<LegalSection number="01" title={copy.privacy.processingTitle}>
								<p>{copy.privacy.processingBody}</p>
							</LegalSection>
							<LegalSection number="02" title={copy.privacy.storageTitle}>
								<p>{copy.privacy.storageBody}</p>
							</LegalSection>
							<LegalSection number="03" title={copy.privacy.hostingTitle}>
								<p>
									{copy.privacy.hostingBefore}
									<a
										href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages"
										className={linkClassName}
									>
										{copy.privacy.hostingLink}
									</a>
									{copy.privacy.hostingAfter}
								</p>
							</LegalSection>
						</>
					) : (
						<>
							<LegalSection number="01" title={copy.terms.useTitle}>
								<p>{copy.terms.useBody}</p>
							</LegalSection>
							<LegalSection number="02" title={copy.terms.responsibilityTitle}>
								<p>{copy.terms.responsibilityBody}</p>
							</LegalSection>
							<LegalSection number="03" title={copy.terms.availabilityTitle}>
								<p>{copy.terms.availabilityBody}</p>
							</LegalSection>
						</>
					)}
					<LegalSection number="04" title={page.contactTitle}>
						<p>
							{page.contactBefore}
							<a href="/#contact-title" className={linkClassName}>
								{copy.contactLink}
							</a>
							{page.contactAfter} {copy.contactNote}
						</p>
					</LegalSection>
				</div>
				<nav aria-label={copy.relatedPages} className="mt-10">
					<Link
						to={kind === "privacy" ? "/terms-of-service" : "/privacy-policy"}
						className={linkClassName}
					>
						{page.relatedLink} →
					</Link>
				</nav>
			</div>
		</main>
	);
}
