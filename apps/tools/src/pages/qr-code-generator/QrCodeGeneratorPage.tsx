import { ArrowLeft, Download, QrCode, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { downloadBlob } from "../../shared/download";
import { useToolsLocale } from "../../toolsLocale";
import { useQrCodeTranslations } from "./locale";
import {
	createQrDesign,
	type DownloadSize,
	defaultLogoSize,
	downloadSizes,
	hasLowQrContrast,
	logoSizeMax,
	logoSizeMin,
	type QrDesign,
	type QrLogo,
	type QrStyle,
	qrStyles,
} from "./qrCodeModel";
import { renderQrCanvas, renderQrSvg } from "./qrCodeRender";
import { LogoError, type LogoErrorCode, loadQrLogo } from "./qrLogo";

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(new Error("PNG encoding failed"));
		}, "image/png");
	});
}

export function QrCodeGeneratorPage() {
	const { t: common } = useToolsLocale();
	const t = useQrCodeTranslations();
	const [content, setContent] = useState("");
	const [foreground, setForeground] = useState("#000000");
	const [background, setBackground] = useState("#ffffff");
	const [size, setSize] = useState<DownloadSize>(512);
	const [style, setStyle] = useState<QrStyle>("square");
	const [logo, setLogo] = useState<QrLogo | null>(null);
	const [logoSize, setLogoSize] = useState(defaultLogoSize);
	const [logoError, setLogoError] = useState<LogoErrorCode | null>(null);
	const [logoLoading, setLogoLoading] = useState(false);
	const [readyDesign, setReadyDesign] = useState<QrDesign | null>(null);
	const [previewError, setPreviewError] = useState(false);
	const [downloadError, setDownloadError] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const logoRequest = useRef(0);
	const empty = content.trim().length === 0;
	const { design, tooLong } = useMemo(() => {
		if (empty) return { design: null, tooLong: false };
		try {
			return {
				design: createQrDesign(
					content,
					style,
					foreground,
					background,
					logo,
					logoSize,
				),
				tooLong: false,
			};
		} catch {
			return { design: null, tooLong: true };
		}
	}, [content, empty, style, foreground, background, logo, logoSize]);
	const ready = Boolean(design && readyDesign === design && !logoLoading);
	const lowContrast = hasLowQrContrast(foreground, background);
	const styleLabels: Record<QrStyle, string> = {
		square: t.styleSquare,
		rounded: t.styleRounded,
		dots: t.styleDots,
	};

	useEffect(() => {
		document.title = `${t.title} | Boy Boni Panjaitan`;
	}, [t.title]);

	useEffect(() => {
		if (!design || !canvasRef.current) return;
		setPreviewError(false);
		try {
			renderQrCanvas(canvasRef.current, design, 512);
			setReadyDesign(design);
		} catch {
			setPreviewError(true);
		}
	}, [design]);

	useEffect(
		() => () => {
			logoRequest.current += 1;
		},
		[],
	);

	async function updateLogo(file: File) {
		const request = ++logoRequest.current;
		setLogoError(null);
		setLogoLoading(true);
		try {
			const next = await loadQrLogo(file);
			if (request === logoRequest.current) setLogo(next);
		} catch (error) {
			if (request === logoRequest.current) {
				setLogoError(error instanceof LogoError ? error.code : "decode");
			}
		} finally {
			if (request === logoRequest.current) setLogoLoading(false);
		}
	}

	async function download(format: "png" | "svg") {
		if (!ready || downloading || !design) return;
		setDownloading(true);
		setDownloadError(false);
		try {
			let blob: Blob;
			if (format === "png") {
				const canvas = document.createElement("canvas");
				renderQrCanvas(canvas, design, size);
				blob = await canvasBlob(canvas);
			} else {
				blob = new Blob([renderQrSvg(design, size)], {
					type: "image/svg+xml;charset=utf-8",
				});
			}
			downloadBlob(blob, `qr-code.${format}`);
		} catch {
			setDownloadError(true);
		} finally {
			setDownloading(false);
		}
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
			<div className="mt-10">
				<h1 className="mt-4 font-display text-5xl font-semibold tracking-tight md:text-6xl">
					{t.title}
				</h1>
				<p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
					{t.intro}
				</p>
			</div>
			<div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
				<div className="min-w-0 space-y-6">
					<section className="border border-ink/20 bg-white p-5 md:p-7">
						<label htmlFor="qr-content" className="tool-label text-sm">
							{t.content}
						</label>
						<input
							id="qr-content"
							type="text"
							className="tool-input mt-3 h-11"
							placeholder={t.contentPlaceholder}
							value={content}
							onChange={(event) => {
								setContent(event.target.value);
								setDownloadError(false);
							}}
							aria-describedby="qr-content-hint"
						/>
						<p id="qr-content-hint" className="mt-2 text-sm text-muted">
							{t.contentHint}
						</p>
					</section>
					<section className="border border-ink/20 bg-white p-5 md:p-7">
						<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">
							{t.appearance}
						</h2>
						<fieldset className="mt-5">
							<legend className="text-sm font-semibold">{t.moduleStyle}</legend>
							<div className="mt-3 grid grid-cols-3 gap-2">
								{qrStyles.map((option) => (
									<label
										key={option}
										className={`cursor-pointer border px-2 py-3 text-center text-sm font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${style === option ? "border-primary bg-primary text-white" : "border-ink/25 bg-white"}`}
									>
										<input
											type="radio"
											name="qr-style"
											value={option}
											checked={style === option}
											onChange={() => setStyle(option)}
											className="sr-only"
										/>
										{styleLabels[option]}
									</label>
								))}
							</div>
						</fieldset>
						<div className="mt-5 grid gap-5 sm:grid-cols-2">
							<div className="tool-label">
								<label htmlFor="qr-foreground">{t.foreground}</label>
								<div className="flex items-center gap-3">
									<input
										id="qr-foreground"
										type="color"
										className="h-11 w-16 cursor-pointer border border-ink/20 bg-white p-1"
										value={foreground}
										onChange={(event) => setForeground(event.target.value)}
									/>
									<span className="font-mono text-sm uppercase">
										{foreground}
									</span>
								</div>
							</div>
							<div className="tool-label">
								<label htmlFor="qr-background">{t.background}</label>
								<div className="flex items-center gap-3">
									<input
										id="qr-background"
										type="color"
										className="h-11 w-16 cursor-pointer border border-ink/20 bg-white p-1"
										value={background}
										onChange={(event) => setBackground(event.target.value)}
									/>
									<span className="font-mono text-sm uppercase">
										{background}
									</span>
								</div>
							</div>
						</div>
						{design && lowContrast && (
							<p
								role="status"
								className="mt-5 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
							>
								{t.contrastWarning}
							</p>
						)}
					</section>
					<section className="border border-ink/20 bg-white p-5 md:p-7">
						<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">
							{t.logoTitle}
						</h2>
						<p className="mt-3 text-sm text-muted">{t.logoHint}</p>
						<input
							id="qr-logo"
							type="file"
							accept="image/png,image/jpeg,image/webp"
							className="peer sr-only"
							onChange={(event) => {
								const file = event.target.files?.[0];
								event.target.value = "";
								if (file) void updateLogo(file);
							}}
						/>
						<div className="mt-5 flex flex-wrap items-center gap-3 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
							<label htmlFor="qr-logo" className="tool-button cursor-pointer">
								<Upload size={17} aria-hidden="true" />
								{logo ? t.replaceLogo : t.addLogo}
							</label>
							{logo && (
								<button
									type="button"
									className="tool-button"
									onClick={() => {
										logoRequest.current += 1;
										setLogo(null);
										setLogoError(null);
										setLogoLoading(false);
									}}
								>
									<Trash2 size={17} aria-hidden="true" />
									{t.removeLogo}
								</button>
							)}
						</div>
						{logoLoading && (
							<p role="status" className="mt-3 text-sm text-muted">
								{t.loadingLogo}
							</p>
						)}
						{logo && (
							<p className="mt-3 break-all text-sm text-muted">{logo.name}</p>
						)}
						{logoError && (
							<p role="alert" className="mt-3 text-sm text-red-800">
								{t[logoError]}
							</p>
						)}
						<label htmlFor="qr-logo-size" className="tool-label mt-6">
							{t.logoSize}: {logoSize}%
						</label>
						<input
							id="qr-logo-size"
							type="range"
							min={logoSizeMin}
							max={logoSizeMax}
							value={logoSize}
							disabled={!logo}
							onChange={(event) => setLogoSize(Number(event.target.value))}
							className="mt-3 w-full accent-primary"
						/>
						<div className="mt-1 flex justify-between font-mono text-xs text-muted">
							<span>{logoSizeMin}%</span>
							<span>{logoSizeMax}%</span>
						</div>
						<p className="mt-5 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
							{t.scanHint}
						</p>
					</section>
				</div>
				<section className="min-w-0 border border-ink/20 bg-white">
					<h2 className="border-b border-ink/15 px-5 py-4 font-mono text-xs font-semibold uppercase tracking-[0.16em]">
						{t.preview}
					</h2>
					<div className="flex min-h-80 items-center justify-center bg-paper p-5 sm:p-8">
						{!design ? (
							<div className="max-w-xs text-center">
								<QrCode
									size={44}
									strokeWidth={1.4}
									className="mx-auto text-primary"
									aria-hidden="true"
								/>
								<p className="mt-5 font-semibold">
									{tooLong ? t.tooLong : t.emptyTitle}
								</p>
								{!tooLong && (
									<p className="mt-2 text-sm text-muted">
										{t.emptyDescription}
									</p>
								)}
							</div>
						) : previewError ? (
							<p role="alert" className="text-center text-sm text-red-800">
								{t.createError}
							</p>
						) : !ready ? (
							<p role="status" className="text-sm text-muted">
								{t.creating}
							</p>
						) : null}
						<div
							className={
								ready && !previewError
									? "relative aspect-square min-w-0 w-full max-w-96"
									: "hidden"
							}
						>
							<canvas
								ref={canvasRef}
								role="img"
								aria-label={t.preview}
								className="absolute inset-0 block !h-full !w-full"
							/>
						</div>
					</div>
					<div className="border-t border-ink/15 p-5">
						<label htmlFor="qr-size" className="tool-label">
							{t.size}
						</label>
						<select
							id="qr-size"
							className="tool-input mt-2"
							value={size}
							onChange={(event) =>
								setSize(Number(event.target.value) as DownloadSize)
							}
						>
							{downloadSizes.map((option) => (
								<option key={option} value={option}>
									{option} × {option} px
								</option>
							))}
						</select>
						<div className="mt-5 grid gap-3 sm:grid-cols-2">
							<button
								type="button"
								className="tool-button tool-button-primary w-full"
								disabled={!ready || downloading || previewError}
								onClick={() => void download("png")}
							>
								<Download size={17} aria-hidden="true" />
								{t.downloadPng}
							</button>
							<button
								type="button"
								className="tool-button w-full"
								disabled={!ready || downloading || previewError}
								onClick={() => void download("svg")}
							>
								<Download size={17} aria-hidden="true" />
								{t.downloadSvg}
							</button>
						</div>
					</div>
					{downloadError && (
						<p role="alert" className="mx-5 mb-5 text-sm text-red-800">
							{t.downloadError}
						</p>
					)}
				</section>
			</div>
		</main>
	);
}
