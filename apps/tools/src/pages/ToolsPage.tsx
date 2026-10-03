import {
	ArrowUpRight,
	CircleDashed,
	Crop,
	FilePenLine,
	Minimize2,
	Pipette,
	QrCode,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useToolsLocale } from "../toolsLocale";
import { colorPickerCard } from "./color-picker/locale";
import { imageCompressorCard } from "./image-compressor/locale";
import { imageEditorCard } from "./image-editor/locale";
import { pdfToolCard } from "./pdf-editor/locale";
import { qrCodeCard } from "./qr-code-generator/locale";
import { spinningWheelCard } from "./spinning-wheel/locale";

const tools = [
	{
		path: "/pdf-editor",
		icon: FilePenLine,
		card: pdfToolCard,
	},
	{
		path: "/color-picker",
		icon: Pipette,
		card: colorPickerCard,
	},
	{
		path: "/qr-code-generator",
		icon: QrCode,
		card: qrCodeCard,
	},
	{
		path: "/spinning-wheel",
		icon: CircleDashed,
		card: spinningWheelCard,
	},
	{
		path: "/image-editor",
		icon: Crop,
		card: imageEditorCard,
	},
	{
		path: "/image-compressor",
		icon: Minimize2,
		card: imageCompressorCard,
	},
] as const;

export function ToolsPage() {
	const { locale, t } = useToolsLocale();
	useEffect(() => {
		document.title = "Tools | Boy Boni Panjaitan";
	}, []);
	return (
		<main className="mx-auto max-w-7xl px-5 pb-24 pt-16 md:px-10 md:pt-24">
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
	);
}
