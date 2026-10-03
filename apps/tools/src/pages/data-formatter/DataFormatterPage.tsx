import { ArrowLeft } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useToolsLocale } from "../../toolsLocale";
import { ConvertPanel } from "./ConvertPanel";
import { FormatPanel } from "./FormatPanel";
import { useDataFormatterTranslations } from "./locale";

type Tab = "format" | "convert";

const tabs: Tab[] = ["format", "convert"];

export function DataFormatterPage() {
	const { t: common } = useToolsLocale();
	const t = useDataFormatterTranslations();
	const [tab, setTab] = useState<Tab>("format");
	const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
		format: null,
		convert: null,
	});
	const labels: Record<Tab, string> = {
		format: t.tabFormat,
		convert: t.tabConvert,
	};

	useEffect(() => {
		document.title = `${t.title} | Boy Boni Panjaitan`;
	}, [t.title]);

	function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
		const index = tabs.indexOf(tab);
		const next =
			event.key === "ArrowRight"
				? tabs[(index + 1) % tabs.length]
				: event.key === "ArrowLeft"
					? tabs[(index - 1 + tabs.length) % tabs.length]
					: event.key === "Home"
						? tabs[0]
						: event.key === "End"
							? tabs[tabs.length - 1]
							: null;
		if (!next) return;
		event.preventDefault();
		setTab(next);
		tabRefs.current[next]?.focus();
	}

	return (
		<main className="mx-auto max-w-7xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
			<Link
				to="/"
				className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
			>
				<ArrowLeft size={16} aria-hidden="true" />
				{common.backToTools}
			</Link>
			<h1 className="mt-14 font-display text-5xl font-semibold tracking-tight md:text-6xl">
				{t.title}
			</h1>
			<p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
				{t.intro}
			</p>
			<div
				role="tablist"
				aria-label={t.title}
				className="mt-10 flex gap-1 border-b border-ink/20"
			>
				{tabs.map((option) => (
					<button
						key={option}
						ref={(element) => {
							tabRefs.current[option] = element;
						}}
						id={`data-formatter-tab-${option}`}
						type="button"
						role="tab"
						aria-selected={tab === option}
						aria-controls={`data-formatter-panel-${option}`}
						tabIndex={tab === option ? 0 : -1}
						className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold ${tab === option ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}
						onClick={() => setTab(option)}
						onKeyDown={handleTabKey}
					>
						{labels[option]}
					</button>
				))}
			</div>
			{/* Both panels stay mounted so switching tabs keeps their input. */}
			{tabs.map((option) => (
				<div
					key={option}
					id={`data-formatter-panel-${option}`}
					role="tabpanel"
					aria-labelledby={`data-formatter-tab-${option}`}
					hidden={tab !== option}
					className="mt-6"
				>
					{option === "format" ? <FormatPanel t={t} /> : <ConvertPanel t={t} />}
				</div>
			))}
		</main>
	);
}
