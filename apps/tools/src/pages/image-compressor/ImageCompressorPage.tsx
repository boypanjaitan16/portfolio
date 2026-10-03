import {
	ArrowLeft,
	Check,
	Download,
	FileArchive,
	ImagePlus,
	Minimize2,
	Trash2,
	TriangleAlert,
} from "lucide-react";
import { type DragEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { NumberField } from "../../components/NumberField";
import {
	acceptsImage,
	defaultQuality,
	downloadBlob,
	exportFormats,
	formatLabels,
	hasQuality,
	imageAccept,
	maxImageFileBytes,
} from "../../shared/imageFiles";
import { useToolsLocale } from "../../toolsLocale";
import {
	CompressError,
	type CompressErrorCode,
	type CompressResult,
	type CompressSettings,
	compressImage,
	minSearchQuality,
	type OutputFormat,
	resolveFormat,
} from "./compressService";
import { useImageCompressorTranslations } from "./locale";
import {
	defaultResize,
	formatBytes,
	maxDimension,
	type ResizeMode,
	type ResizeSettings,
	resizeModes,
	savingsPercent,
} from "./resizeModel";
import { uniqueNames, zipParts } from "./zipWriter";

type Status = "waiting" | "processing" | "done" | "error";
type Item = {
	id: number;
	file: File;
	previewUrl: string;
	width: number | null;
	height: number | null;
	status: Status;
	result: CompressResult | null;
	error: CompressErrorCode | null;
	/** Settings used for the last result, to detect outdated results. */
	settingsKey: string | null;
	/** Target size in KB used for the last result, if any. */
	targetKb: number | null;
};
type ImageCompressorText = ReturnType<typeof useImageCompressorTranslations>;

const maxItems = 30;
const defaultTargetKb = 200;

function fill(template: string, values: Record<string, string | number>) {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		key in values ? String(values[key]) : match,
	);
}

function changeLabel(
	before: number,
	after: number,
	t: ImageCompressorText,
): string {
	const percent = savingsPercent(before, after);
	return percent >= 0
		? fill(t.saved, { percent })
		: fill(t.grew, { percent: -percent });
}

export function ImageCompressorPage() {
	const { locale, t: common } = useToolsLocale();
	const t = useImageCompressorTranslations();
	const [items, setItems] = useState<Item[]>([]);
	const [format, setFormat] = useState<OutputFormat>("original");
	const [quality, setQuality] = useState(defaultQuality);
	const [targetEnabled, setTargetEnabled] = useState(false);
	const [targetKb, setTargetKb] = useState<number | null>(defaultTargetKb);
	const [resize, setResize] = useState<ResizeSettings>(defaultResize);
	const [running, setRunning] = useState(false);
	const [zipping, setZipping] = useState(false);
	const [notices, setNotices] = useState<string[]>([]);
	const [dragActive, setDragActive] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const itemsRef = useRef<Item[]>([]);
	const nextIdRef = useRef(1);
	const runIdRef = useRef(0);
	itemsRef.current = items;

	const settings: CompressSettings = {
		format,
		quality,
		targetKb: targetEnabled ? targetKb : null,
		resize,
	};
	const settingsKey = JSON.stringify(settings);
	const formats = new Set(
		items.map((item) => resolveFormat(item.file, format)),
	);
	const anyLossy = items.length === 0 || [...formats].some(hasQuality);
	const anyJpeg = formats.has("image/jpeg");
	const finished = items.filter((item) => item.result);
	const outdated = items.some(
		(item) => item.settingsKey !== null && item.settingsKey !== settingsKey,
	);
	const totalBefore = finished.reduce((sum, item) => sum + item.file.size, 0);
	const totalAfter = finished.reduce(
		(sum, item) => sum + (item.result?.blob.size ?? 0),
		0,
	);
	const processed = items.filter(
		(item) => item.status === "done" || item.status === "error",
	).length;

	useEffect(() => {
		document.title = `${t.title} | Boy Boni Panjaitan`;
	}, [t.title]);
	useEffect(
		() => () => {
			runIdRef.current += 1;
			for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl);
		},
		[],
	);

	function updateItem(id: number, changes: Partial<Item>) {
		setItems((current) =>
			current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
		);
	}

	function addFiles(files: File[]) {
		const skipped: string[] = [];
		const accepted: File[] = [];
		for (const file of files) {
			if (!acceptsImage(file) || file.size > maxImageFileBytes)
				skipped.push(file.name);
			else accepted.push(file);
		}
		const room = maxItems - itemsRef.current.length;
		const added = accepted.slice(0, Math.max(0, room));
		const next: string[] = [];
		if (skipped.length > 0)
			next.push(fill(t.skipped, { names: skipped.join(", ") }));
		if (accepted.length > added.length) next.push(t.tooMany);
		setNotices(next);
		if (added.length === 0) return;
		setItems((current) => [
			...current,
			...added.map((file) => ({
				id: nextIdRef.current++,
				file,
				previewUrl: URL.createObjectURL(file),
				width: null,
				height: null,
				status: "waiting" as const,
				result: null,
				error: null,
				settingsKey: null,
				targetKb: null,
			})),
		]);
	}

	function removeItem(id: number) {
		const item = itemsRef.current.find((candidate) => candidate.id === id);
		if (item) URL.revokeObjectURL(item.previewUrl);
		setItems((current) => current.filter((candidate) => candidate.id !== id));
	}

	function clearAll() {
		runIdRef.current += 1;
		for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl);
		setItems([]);
		setNotices([]);
		setRunning(false);
	}

	async function compressAll() {
		const runId = ++runIdRef.current;
		const runSettings = settings;
		const key = settingsKey;
		setRunning(true);
		setItems((current) =>
			current.map((item) => ({
				...item,
				status: "waiting",
				result: null,
				error: null,
				settingsKey: null,
			})),
		);
		for (const { id } of itemsRef.current) {
			if (runId !== runIdRef.current) return;
			const item = itemsRef.current.find((candidate) => candidate.id === id);
			if (!item) continue;
			updateItem(id, { status: "processing" });
			try {
				const result = await compressImage(item.file, runSettings);
				if (runId !== runIdRef.current) return;
				updateItem(id, {
					status: "done",
					result,
					settingsKey: key,
					targetKb: runSettings.targetKb,
				});
			} catch (error) {
				if (runId !== runIdRef.current) return;
				updateItem(id, {
					status: "error",
					error: error instanceof CompressError ? error.code : "exportFailed",
					settingsKey: key,
				});
			}
		}
		if (runId === runIdRef.current) setRunning(false);
	}

	async function downloadZip() {
		setZipping(true);
		try {
			const done = itemsRef.current.flatMap((item) =>
				item.result ? [item.result] : [],
			);
			const names = uniqueNames(done.map((result) => result.name));
			const entries = await Promise.all(
				done.map(async (result, index) => ({
					name: names[index],
					data: new Uint8Array(await result.blob.arrayBuffer()),
				})),
			);
			downloadBlob(
				new Blob(zipParts(entries), { type: "application/zip" }),
				"compressed-images.zip",
			);
		} catch {
			setNotices([t.zipFailed]);
		} finally {
			setZipping(false);
		}
	}

	function updateResize(changes: Partial<ResizeSettings>) {
		setResize((current) => ({ ...current, ...changes }));
	}

	function handleDrop(event: DragEvent<HTMLFieldSetElement>) {
		event.preventDefault();
		setDragActive(false);
		addFiles([...event.dataTransfer.files]);
	}

	const size = (bytes: number) => formatBytes(bytes, locale);

	return (
		<main className="mx-auto max-w-7xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
			<Link
				to="/"
				className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
			>
				<ArrowLeft size={16} aria-hidden="true" />
				{common.backToTools}
			</Link>
			<div className="mt-10 flex flex-wrap items-end justify-between gap-5">
				<div>
					<h1 className="mt-4 font-display text-5xl font-semibold tracking-tight md:text-6xl">
						{t.title}
					</h1>
					<p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
						{t.intro}
					</p>
				</div>
				<button
					type="button"
					className="tool-button tool-button-primary"
					disabled={items.length >= maxItems}
					onClick={() => inputRef.current?.click()}
				>
					<ImagePlus size={18} aria-hidden="true" />
					{items.length > 0 ? t.addImages : t.chooseImages}
				</button>
			</div>
			<input
				ref={inputRef}
				type="file"
				multiple
				accept={imageAccept}
				aria-label={t.chooseImages}
				className="sr-only"
				onChange={(event) => {
					addFiles([...(event.target.files ?? [])]);
					event.target.value = "";
				}}
			/>
			{notices.length > 0 && (
				<div
					role="alert"
					className="mt-6 grid gap-1 border border-red-300 bg-red-50 p-4 text-sm text-red-800"
				>
					{notices.map((notice) => (
						<p key={notice}>{notice}</p>
					))}
				</div>
			)}
			<div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
				<section className="min-w-0 border border-ink/20 bg-white">
					<div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/15 px-5 py-4">
						<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">
							{t.filesTitle}
						</h2>
						<span className="font-mono text-xs text-muted">
							{fill(t.fileCount, { count: items.length, max: maxItems })}
						</span>
					</div>
					<fieldset
						onDragEnter={(event) => {
							event.preventDefault();
							setDragActive(true);
						}}
						onDragOver={(event) => event.preventDefault()}
						onDragLeave={(event) => {
							if (!event.currentTarget.contains(event.relatedTarget as Node))
								setDragActive(false);
						}}
						onDrop={handleDrop}
						className={`min-w-0 p-5 md:p-8 ${dragActive ? "bg-primary/10" : "bg-paper/70"}`}
					>
						<legend className="sr-only">{t.filesTitle}</legend>
						{items.length === 0 ? (
							<div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-ink/30 px-5 text-center">
								<Minimize2
									size={38}
									strokeWidth={1.4}
									className="text-primary"
									aria-hidden="true"
								/>
								<p className="mt-5 text-xl font-semibold">{t.emptyTitle}</p>
								<p className="mt-2 text-sm text-muted">{t.emptyDescription}</p>
								<p className="mt-5 font-mono text-xs text-muted">
									{t.dropHint} · {t.formats}
								</p>
							</div>
						) : (
							<ul className="grid gap-3">
								{items.map((item) => (
									<li
										key={item.id}
										className="flex flex-wrap items-center gap-4 border border-ink/15 bg-white p-3"
									>
										<img
											src={item.previewUrl}
											alt=""
											className="h-16 w-16 shrink-0 border border-ink/10 object-cover"
											onLoad={(event) =>
												updateItem(item.id, {
													width: event.currentTarget.naturalWidth,
													height: event.currentTarget.naturalHeight,
												})
											}
										/>
										<div className="min-w-0 flex-1 text-sm">
											<p className="truncate font-semibold">{item.file.name}</p>
											<p className="mt-1 font-mono text-xs text-muted">
												{t.original}:{" "}
												{item.width && item.height
													? `${fill(t.dimensions, { width: item.width, height: item.height })} · `
													: ""}
												{size(item.file.size)}
											</p>
											<ItemStatus item={item} t={t} size={size} />
										</div>
										<div className="flex gap-2">
											{item.result && (
												<button
													type="button"
													className="tool-button px-3"
													aria-label={fill(t.downloadNamed, {
														name: item.result.name,
													})}
													onClick={() =>
														item.result &&
														downloadBlob(item.result.blob, item.result.name)
													}
												>
													<Download size={15} aria-hidden="true" />
													<span className="hidden sm:inline">{t.download}</span>
												</button>
											)}
											<button
												type="button"
												className="tool-button px-3"
												aria-label={fill(t.removeNamed, {
													name: item.file.name,
												})}
												onClick={() => removeItem(item.id)}
											>
												<Trash2 size={15} aria-hidden="true" />
											</button>
										</div>
									</li>
								))}
							</ul>
						)}
					</fieldset>
					{items.length > 0 && (
						<div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/15 px-5 py-4">
							<p className="font-mono text-xs text-muted">
								{finished.length > 0 &&
									fill(t.totals, {
										before: size(totalBefore),
										after: size(totalAfter),
										percent: changeLabel(totalBefore, totalAfter, t),
									})}
							</p>
							<div className="flex flex-wrap gap-2">
								{finished.length >= 2 && (
									<button
										type="button"
										className="tool-button"
										disabled={zipping || running}
										onClick={() => void downloadZip()}
									>
										<FileArchive size={15} aria-hidden="true" />
										{zipping ? t.preparingZip : t.downloadAll}
									</button>
								)}
								<button
									type="button"
									className="tool-button"
									onClick={clearAll}
								>
									{t.clearAll}
								</button>
							</div>
						</div>
					)}
				</section>
				<section className="border border-ink/20 bg-white p-5">
					<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted">
						{t.settingsTitle}
					</h2>
					<fieldset disabled={running} className="mt-4 grid min-w-0 gap-5">
						<legend className="sr-only">{t.settingsTitle}</legend>
						<label className="tool-label">
							{t.format}
							<select
								className="tool-input"
								value={format}
								onChange={(event) =>
									setFormat(event.target.value as OutputFormat)
								}
							>
								<option value="original">{t.format_original}</option>
								{exportFormats.map((option) => (
									<option key={option} value={option}>
										{formatLabels[option]}
									</option>
								))}
							</select>
						</label>
						{anyLossy ? (
							<>
								<label className="tool-label">
									<span className="flex justify-between">
										{t.quality}
										<span className="font-mono">{quality}%</span>
									</span>
									<input
										type="range"
										min={minSearchQuality}
										max={100}
										step={1}
										value={quality}
										className="accent-primary"
										onChange={(event) => setQuality(Number(event.target.value))}
									/>
									<span className="font-normal text-muted">
										{t.qualityHint}
									</span>
								</label>
								<div className="grid gap-3">
									<label className="flex items-center gap-2 text-sm font-semibold">
										<input
											type="checkbox"
											className="accent-primary"
											checked={targetEnabled}
											onChange={(event) =>
												setTargetEnabled(event.target.checked)
											}
										/>
										{t.targetEnabled}
									</label>
									{targetEnabled && (
										<>
											<NumberField
												optional
												label={t.targetKb}
												value={targetKb}
												min={1}
												step={10}
												onCommit={setTargetKb}
											/>
											<p className="text-xs leading-relaxed text-muted">
												{t.targetHint}
											</p>
										</>
									)}
								</div>
							</>
						) : (
							<p className="text-xs leading-relaxed text-muted">{t.pngNote}</p>
						)}
						{anyJpeg && (
							<p className="text-xs leading-relaxed text-muted">{t.jpegNote}</p>
						)}
						<fieldset className="grid gap-3 border-t border-ink/10 pt-4">
							<legend className="tool-label float-left mb-2 w-full pt-4">
								{t.resizeTitle}
							</legend>
							<div className="grid grid-cols-2 gap-2">
								{resizeModes.map((mode) => (
									<label
										key={mode}
										className={`flex cursor-pointer items-center gap-2 border p-2 text-xs font-semibold ${resize.mode === mode ? "border-primary text-primary" : "border-ink/20"}`}
									>
										<input
											type="radio"
											name="resize-mode"
											className="accent-primary"
											checked={resize.mode === mode}
											onChange={() => updateResize({ mode })}
										/>
										{t[`resize_${mode}` as `resize_${ResizeMode}`]}
									</label>
								))}
							</div>
							{resize.mode === "percent" && (
								<NumberField
									label={t.percent}
									value={resize.percent}
									min={1}
									max={resize.allowUpscale ? 400 : 100}
									step={1}
									onCommit={(percent) => updateResize({ percent })}
								/>
							)}
							{resize.mode === "dimensions" && (
								<>
									<div className="grid grid-cols-2 gap-3">
										<NumberField
											optional
											label={t.width}
											value={resize.width}
											min={1}
											max={maxDimension}
											step={1}
											onCommit={(width) => updateResize({ width })}
										/>
										<NumberField
											optional
											label={t.height}
											value={resize.height}
											min={1}
											max={maxDimension}
											step={1}
											onCommit={(height) => updateResize({ height })}
										/>
									</div>
									<label className="flex items-center gap-2 text-sm font-semibold">
										<input
											type="checkbox"
											className="accent-primary"
											checked={resize.keepRatio}
											onChange={(event) =>
												updateResize({ keepRatio: event.target.checked })
											}
										/>
										{t.keepRatio}
									</label>
									<p className="text-xs leading-relaxed text-muted">
										{t.dimensionsHint}
									</p>
								</>
							)}
							{resize.mode === "longestSide" && (
								<NumberField
									label={t.longestSide}
									value={resize.longestSide}
									min={1}
									max={maxDimension}
									step={1}
									onCommit={(longestSide) => updateResize({ longestSide })}
								/>
							)}
							{resize.mode !== "none" && (
								<label className="flex items-center gap-2 text-sm font-semibold">
									<input
										type="checkbox"
										className="accent-primary"
										checked={resize.allowUpscale}
										onChange={(event) =>
											updateResize({ allowUpscale: event.target.checked })
										}
									/>
									{t.allowUpscale}
								</label>
							)}
						</fieldset>
					</fieldset>
					<div className="mt-6 grid gap-3 border-t border-ink/10 pt-5">
						{outdated && !running && (
							<p className="flex gap-2 text-sm text-amber-800">
								<TriangleAlert
									size={16}
									className="mt-0.5 shrink-0"
									aria-hidden="true"
								/>
								{t.outdated}
							</p>
						)}
						<button
							type="button"
							className="tool-button tool-button-primary"
							disabled={items.length === 0 || running}
							onClick={() => void compressAll()}
						>
							<Minimize2 size={16} aria-hidden="true" />
							{running
								? fill(t.compressing, {
										done: processed,
										total: items.length,
									})
								: items.length === 1
									? t.compressOne
									: fill(t.compress, { count: items.length })}
						</button>
						<p className="text-xs leading-relaxed text-muted">
							{t.metadataNote}
						</p>
					</div>
				</section>
			</div>
		</main>
	);
}

function ItemStatus({
	item,
	t,
	size,
}: {
	item: Item;
	t: ImageCompressorText;
	size: (bytes: number) => string;
}) {
	if (item.status === "waiting" || item.status === "processing")
		return (
			<p className="mt-1 text-xs text-muted" role="status">
				{item.status === "waiting" ? t.status_waiting : t.status_processing}
			</p>
		);
	if (item.status === "error" || !item.result)
		return (
			<p className="mt-1 text-xs text-red-700">
				{t[item.error ?? "exportFailed"]}
			</p>
		);
	const { result } = item;
	const grew = result.blob.size > item.file.size;
	return (
		<>
			<p
				className={`mt-1 font-mono text-xs ${grew ? "text-amber-800" : "text-primary"}`}
			>
				{grew ? (
					<TriangleAlert size={13} className="mr-1 inline" aria-hidden="true" />
				) : (
					<Check size={13} className="mr-1 inline" aria-hidden="true" />
				)}
				{t.result}:{" "}
				{fill(t.dimensions, { width: result.width, height: result.height })} ·{" "}
				{size(result.blob.size)} ·{" "}
				{changeLabel(item.file.size, result.blob.size, t)}
			</p>
			{result.targetMissed && (
				<p className="mt-1 text-xs text-amber-800">
					{fill(t.targetMissed, { target: `${item.targetKb} KB` })}
				</p>
			)}
		</>
	);
}
