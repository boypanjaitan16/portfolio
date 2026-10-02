import {
	ArrowDown,
	ArrowLeft,
	ArrowUp,
	Check,
	Download,
	FilePlus2,
	ImagePlus,
	RotateCcw,
	RotateCw,
	Signature,
	Trash2,
	Type,
	X,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useToolsLocale } from "../toolsLocale";
import { usePdfTranslations } from "./locale";
import { PdfCanvas } from "./PdfCanvas";
import {
	type Annotation,
	clampAnnotation,
	displayRotation,
	type EditorPage,
	movePage,
	type SourceDocument,
} from "./pdfModel";
import { downloadPdf, exportPdf, openPdf } from "./pdfService";
import { SignaturePad } from "./SignaturePad";

type DragState = {
	id: string;
	mode: "move" | "resize";
	x: number;
	y: number;
	original: Annotation;
};

function imageSize(
	dataUrl: string,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () =>
			resolve({ width: image.naturalWidth, height: image.naturalHeight });
		image.onerror = reject;
		image.src = dataUrl;
	});
}

function fileToDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export function PdfEditorPage() {
	const { t: common } = useToolsLocale();
	const t = usePdfTranslations();
	useEffect(() => {
		document.title = `${t.pdfTitle} | Boy Boni Panjaitan`;
	}, [t.pdfTitle]);
	const [sources, setSources] = useState<SourceDocument[]>([]);
	const sourcesRef = useRef<SourceDocument[]>([]);
	const [pages, setPages] = useState<EditorPage[]>([]);
	const [activePageId, setActivePageId] = useState<string | null>(null);
	const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(
		null,
	);
	const [error, setError] = useState("");
	const [busy, setBusy] = useState<"load" | "save" | null>(null);
	const [signatureOpen, setSignatureOpen] = useState(false);
	const [previewWidth, setPreviewWidth] = useState(0);
	const [zoomPercent, setZoomPercent] = useState(100);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const previewViewportRef = useRef<HTMLDivElement>(null);
	const stageContainerRef = useRef<HTMLDivElement>(null);
	const dragRef = useRef<DragState | null>(null);
	const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];
	const activeAnnotation = activePage?.annotations.find(
		(annotation) => annotation.id === activeAnnotationId,
	);
	const activeSource = sources.find(
		(source) => source.id === activePage?.sourceId,
	);
	const selectedCount = pages.filter((page) => page.selected).length;
	const hasPages = pages.length > 0;

	useEffect(() => {
		if (!hasPages) return;
		const viewport = previewViewportRef.current;
		if (!viewport) return;
		const updateWidth = () => {
			const style = window.getComputedStyle(viewport);
			const padding =
				(Number.parseFloat(style.paddingLeft) || 0) +
				(Number.parseFloat(style.paddingRight) || 0);
			const width =
				viewport.clientWidth || viewport.getBoundingClientRect().width;
			if (width > 0) setPreviewWidth(Math.max(1, width - padding));
		};
		updateWidth();
		const observer =
			"ResizeObserver" in window ? new ResizeObserver(updateWidth) : null;
		observer?.observe(viewport);
		window.addEventListener("resize", updateWidth);
		return () => {
			observer?.disconnect();
			window.removeEventListener("resize", updateWidth);
		};
	}, [hasPages]);
	useEffect(() => {
		sourcesRef.current = sources;
	}, [sources]);
	useEffect(
		() => () => {
			for (const source of sourcesRef.current)
				void source.loadingTask.destroy();
		},
		[],
	);

	const changePage = useCallback(
		(id: string, update: (page: EditorPage) => EditorPage) => {
			setPages((current) =>
				current.map((page) => (page.id === id ? update(page) : page)),
			);
		},
		[],
	);
	const changeAnnotation = (
		id: string,
		update: (annotation: Annotation) => Annotation,
	) => {
		if (!activePage) return;
		changePage(activePage.id, (page) => ({
			...page,
			annotations: page.annotations.map((annotation) =>
				annotation.id === id
					? clampAnnotation(update(annotation), page.width, page.height)
					: annotation,
			),
		}));
	};
	const addAnnotation = (annotation: Annotation) => {
		if (!activePage) return;
		changePage(activePage.id, (page) => ({
			...page,
			annotations: [
				...page.annotations,
				clampAnnotation(annotation, page.width, page.height),
			],
		}));
		setActiveAnnotationId(annotation.id);
	};

	async function addFiles(files: FileList | File[]) {
		if (!files.length || busy) return;
		setBusy("load");
		setError("");
		const nextSources: SourceDocument[] = [];
		const nextPages: EditorPage[] = [];
		const failures: string[] = [];
		for (const file of Array.from(files)) {
			try {
				const result = await openPdf(file);
				nextSources.push(result.source);
				nextPages.push(...result.pages);
			} catch (cause) {
				const reason =
					cause instanceof Error && cause.message === "encrypted"
						? t.encryptedPdf
						: t.invalidPdf;
				failures.push(
					t.fileError.replace("{name}", file.name).replace("{reason}", reason),
				);
			}
		}
		setSources((current) => [...current, ...nextSources]);
		setPages((current) => [...current, ...nextPages]);
		setActivePageId((current) => current ?? nextPages[0]?.id ?? null);
		setError(failures.join(" "));
		setBusy(null);
	}

	async function addImage(file: File) {
		if (!activePage) return;
		if (!["image/png", "image/jpeg"].includes(file.type)) {
			setError(t.invalidImage);
			return;
		}
		try {
			const dataUrl = await fileToDataUrl(file);
			const dimensions = await imageSize(dataUrl);
			const width = Math.min(activePage.width * 0.5, 240);
			const height = (width * dimensions.height) / dimensions.width;
			addAnnotation({
				id: crypto.randomUUID(),
				type: "image",
				x: 40,
				y: 40,
				width,
				height,
				dataUrl,
			});
			setError("");
		} catch {
			setError(t.invalidImage);
		}
	}

	function clearWorkspace() {
		for (const source of sourcesRef.current) void source.loadingTask.destroy();
		sourcesRef.current = [];
		setSources([]);
		setPages([]);
		setActivePageId(null);
		setActiveAnnotationId(null);
		setError("");
	}

	async function save(selectedOnly: boolean) {
		const exportPages = selectedOnly
			? pages.filter((page) => page.selected)
			: pages;
		if (!exportPages.length) {
			setError(t.noSelected);
			return;
		}
		setBusy("save");
		setError("");
		try {
			const bytes = await exportPdf(exportPages, sources);
			downloadPdf(bytes, selectedOnly ? t.selectedOutputName : t.outputName);
		} catch {
			setError(t.exportError);
		} finally {
			setBusy(null);
		}
	}

	const rotation = activePage ? displayRotation(activePage) : 0;
	const quarterTurn = rotation === 90 || rotation === 270;
	const availableWidth = previewWidth || Math.max(1, window.innerWidth - 56);
	const fitScale = activePage
		? Math.min(
				1,
				Math.min(680, availableWidth) /
					(quarterTurn ? activePage.height : activePage.width),
				740 / (quarterTurn ? activePage.width : activePage.height),
			)
		: 1;
	const scale = fitScale * (zoomPercent / 100);
	const canvasWidth = activePage ? activePage.width * scale : 0;
	const canvasHeight = activePage ? activePage.height * scale : 0;
	const displayWidth = quarterTurn ? canvasHeight : canvasWidth;
	const displayHeight = quarterTurn ? canvasWidth : canvasHeight;

	function stagePoint(event: React.PointerEvent): { x: number; y: number } {
		const bounds = stageContainerRef.current?.getBoundingClientRect();
		if (!bounds || !activePage) return { x: 0, y: 0 };
		const dx = event.clientX - (bounds.left + bounds.width / 2);
		const dy = event.clientY - (bounds.top + bounds.height / 2);
		const radians = (rotation * Math.PI) / 180;
		return {
			x:
				(dx * Math.cos(radians) + dy * Math.sin(radians) + canvasWidth / 2) /
				scale,
			y:
				(-dx * Math.sin(radians) + dy * Math.cos(radians) + canvasHeight / 2) /
				scale,
		};
	}
	function startDrag(
		event: React.PointerEvent<HTMLElement>,
		annotation: Annotation,
		mode: DragState["mode"],
	) {
		event.preventDefault();
		event.stopPropagation();
		const point = stagePoint(event);
		dragRef.current = {
			id: annotation.id,
			mode,
			x: point.x,
			y: point.y,
			original: annotation,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
		setActiveAnnotationId(annotation.id);
	}
	function drag(event: React.PointerEvent<HTMLElement>) {
		const state = dragRef.current;
		if (!state || !activePage) return;
		const point = stagePoint(event);
		changeAnnotation(state.id, (annotation) =>
			state.mode === "move"
				? {
						...annotation,
						x: state.original.x + point.x - state.x,
						y: state.original.y + point.y - state.y,
					}
				: {
						...annotation,
						width: state.original.width + point.x - state.x,
						height: state.original.height + point.y - state.y,
					},
		);
	}

	return (
		<main className="mx-auto max-w-7xl px-5 pb-20 pt-10 md:px-10">
			<Link
				to="/"
				className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted hover:text-primary"
			>
				<ArrowLeft size={16} />
				{common.backToTools}
			</Link>
			<div className="mt-9 flex flex-wrap items-end justify-between gap-6">
				<div>
					<p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
						{t.privacy}
					</p>
					<h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
						{t.pdfTitle}
					</h1>
					<p className="mt-4 max-w-2xl leading-relaxed text-muted">
						{t.pdfIntro}
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						className="tool-button tool-button-primary"
						disabled={!!busy}
						onClick={() => fileInputRef.current?.click()}
					>
						<FilePlus2 size={17} />
						{t.addPdfs}
					</button>
					{sources.length > 0 && (
						<button
							type="button"
							className="tool-button"
							onClick={clearWorkspace}
						>
							{t.reset}
						</button>
					)}
				</div>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept=".pdf,application/pdf"
				multiple
				className="sr-only"
				aria-label={t.choosePdfs}
				onChange={(event) => {
					if (event.target.files) void addFiles(event.target.files);
					event.target.value = "";
				}}
			/>
			<input
				ref={imageInputRef}
				type="file"
				accept="image/png,image/jpeg"
				className="sr-only"
				aria-label={t.imageFile}
				onChange={(event) => {
					const file = event.target.files?.[0];
					if (file) void addImage(file);
					event.target.value = "";
				}}
			/>
			{error && (
				<div
					role="alert"
					className="mt-6 border-l-4 border-primary bg-primary/10 p-4 text-sm"
				>
					{error}
				</div>
			)}
			{busy === "load" && (
				<p role="status" className="mt-6 text-sm text-muted">
					{t.loading}
				</p>
			)}
			{pages.length === 0 ? (
				<section
					aria-label={t.choosePdfs}
					className="mt-12 grid min-h-80 place-items-center border-2 border-dashed border-ink/25 bg-white p-8 text-center"
					onDragOver={(event) => event.preventDefault()}
					onDrop={(event) => {
						event.preventDefault();
						void addFiles(event.dataTransfer.files);
					}}
				>
					<div>
						<FilePlus2
							className="mx-auto text-primary"
							size={42}
							strokeWidth={1.4}
						/>
						<p className="mt-4 text-xl font-semibold">{t.noPages}</p>
						<p className="mt-2 text-sm text-muted">{t.dropHint}</p>
						<button
							type="button"
							className="tool-button tool-button-primary mt-6"
							onClick={() => fileInputRef.current?.click()}
						>
							{t.choosePdfs}
						</button>
					</div>
				</section>
			) : (
				<>
					<div className="mt-9 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_260px]">
						<aside className="border border-ink/15 bg-white p-4">
							<div className="flex items-center justify-between border-b border-ink/15 pb-3">
								<h2 className="font-semibold">{t.documentPages}</h2>
								<span className="font-mono text-xs text-muted">
									{pages.length} {t.pages}
								</span>
							</div>
							<div className="mt-4 max-h-[750px] space-y-3 overflow-y-auto pr-1">
								{pages.map((page, index) => {
									const source = sources.find(
										(item) => item.id === page.sourceId,
									);
									if (!source) return null;
									return (
										<div
											key={page.id}
											className={`border p-2 ${activePage?.id === page.id ? "border-primary bg-primary/5" : "border-ink/15"}`}
										>
											<div className="flex gap-3">
												<label className="pt-1" title={t.includePage}>
													<input
														type="checkbox"
														checked={page.selected}
														aria-label={`${t.includePage}: ${index + 1}`}
														onChange={(event) =>
															changePage(page.id, (item) => ({
																...item,
																selected: event.target.checked,
															}))
														}
													/>
												</label>
												<button
													type="button"
													className="min-w-0 flex-1 text-left"
													aria-label={`${t.selectPage} ${index + 1}`}
													onClick={() => {
														setActivePageId(page.id);
														setActiveAnnotationId(null);
													}}
												>
													<div
														className="mx-auto w-fit overflow-hidden border border-ink/10 shadow-sm"
														style={{
															transform: `rotate(${displayRotation(page)}deg)`,
														}}
													>
														<PdfCanvas
															source={source}
															pageIndex={page.sourceIndex}
															width={Math.min(
																76,
																(page.width / page.height) * 100,
															)}
															height={Math.min(
																100,
																(page.height / page.width) * 76,
															)}
														/>
													</div>
													<span className="mt-2 block truncate text-xs font-semibold">
														{t.page} {index + 1}
													</span>
													<span className="block truncate text-[11px] text-muted">
														{source.name}
													</span>
												</button>
											</div>
											<div className="mt-2 flex justify-end gap-1">
												<button
													type="button"
													className="icon-button"
													aria-label={`${t.moveUp} ${index + 1}`}
													disabled={index === 0}
													onClick={() =>
														setPages((current) => movePage(current, index, -1))
													}
												>
													<ArrowUp size={15} />
												</button>
												<button
													type="button"
													className="icon-button"
													aria-label={`${t.moveDown} ${index + 1}`}
													disabled={index === pages.length - 1}
													onClick={() =>
														setPages((current) => movePage(current, index, 1))
													}
												>
													<ArrowDown size={15} />
												</button>
												<button
													type="button"
													className="icon-button"
													aria-label={`${t.rotateLeft} ${index + 1}`}
													onClick={() =>
														changePage(page.id, (item) => ({
															...item,
															rotation: (item.rotation + 270) % 360,
														}))
													}
												>
													<RotateCcw size={15} />
												</button>
												<button
													type="button"
													className="icon-button"
													aria-label={`${t.rotateRight} ${index + 1}`}
													onClick={() =>
														changePage(page.id, (item) => ({
															...item,
															rotation: (item.rotation + 90) % 360,
														}))
													}
												>
													<RotateCw size={15} />
												</button>
												<button
													type="button"
													className="icon-button hover:text-primary"
													aria-label={`${t.deletePage} ${index + 1}`}
													onClick={() => {
														setPages((current) =>
															current.filter((item) => item.id !== page.id),
														);
														if (activePageId === page.id)
															setActivePageId(
																pages.find((item) => item.id !== page.id)?.id ??
																	null,
															);
													}}
												>
													<Trash2 size={15} />
												</button>
											</div>
										</div>
									);
								})}
							</div>
						</aside>
						<section className="min-w-0 border border-ink/15 bg-white">
							<div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/15 px-5 py-4">
								<h2 className="font-semibold">{t.preview}</h2>
								<div className="flex flex-wrap items-center gap-3">
									<span className="font-mono text-xs text-muted">
										{activePage
											? `${t.page} ${pages.indexOf(activePage) + 1} · ${rotation}°`
											: ""}
									</span>
									<fieldset className="flex items-center border border-ink/20">
										<legend className="sr-only">{t.zoomControls}</legend>
										<button
											type="button"
											className="icon-button"
											aria-label={t.zoomOut}
											disabled={zoomPercent <= 50}
											onClick={() =>
												setZoomPercent((current) => Math.max(50, current - 25))
											}
										>
											<ZoomOut size={16} />
										</button>
										<button
											type="button"
											className="min-w-14 border-x border-ink/20 px-2 py-1 font-mono text-xs hover:bg-ink/5"
											aria-label={`${t.resetZoom}: ${zoomPercent}%`}
											onClick={() => setZoomPercent(100)}
										>
											{zoomPercent}%
										</button>
										<button
											type="button"
											className="icon-button"
											aria-label={t.zoomIn}
											disabled={zoomPercent >= 300}
											onClick={() =>
												setZoomPercent((current) => Math.min(300, current + 25))
											}
										>
											<ZoomIn size={16} />
										</button>
									</fieldset>
								</div>
							</div>
							{activePage && activeSource ? (
								<div
									ref={previewViewportRef}
									className="overflow-auto bg-[#e7e3dc] p-4 sm:p-6"
								>
									<div
										ref={stageContainerRef}
										data-testid="pdf-preview-stage"
										className="relative mx-auto"
										style={{ width: displayWidth, height: displayHeight }}
									>
										<div
											className="absolute left-1/2 top-1/2 bg-white shadow-soft"
											style={{
												width: canvasWidth,
												height: canvasHeight,
												transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
											}}
										>
											<PdfCanvas
												source={activeSource}
												pageIndex={activePage.sourceIndex}
												width={canvasWidth}
												height={canvasHeight}
											/>
											<div className="absolute inset-0">
												{activePage.annotations.map((annotation) => (
													<button
														key={annotation.id}
														type="button"
														aria-label={
															annotation.type === "text"
																? annotation.text
																: annotation.type === "signature"
																	? t.signatureAlt
																	: t.imageAlt
														}
														onClick={() => setActiveAnnotationId(annotation.id)}
														onPointerDown={(event) =>
															startDrag(event, annotation, "move")
														}
														onPointerMove={drag}
														onPointerUp={() => {
															dragRef.current = null;
														}}
														onPointerCancel={() => {
															dragRef.current = null;
														}}
														className={`absolute cursor-move touch-none overflow-visible border ${activeAnnotationId === annotation.id ? "border-primary" : "border-transparent hover:border-primary/60"}`}
														style={{
															left: annotation.x * scale,
															top: annotation.y * scale,
															width: annotation.width * scale,
															height: annotation.height * scale,
														}}
													>
														{annotation.type === "text" ? (
															<span
																className="block h-full overflow-hidden whitespace-pre-wrap break-words font-pdf"
																style={{
																	fontSize: annotation.fontSize * scale,
																	lineHeight: 1.25,
																	color: annotation.color,
																}}
															>
																{annotation.text}
															</span>
														) : (
															<img
																src={annotation.dataUrl}
																alt=""
																draggable={false}
																className="h-full w-full object-fill"
															/>
														)}
														{activeAnnotationId === annotation.id && (
															<span
																aria-hidden="true"
																className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize border border-white bg-primary"
																onPointerDown={(event) =>
																	startDrag(event, annotation, "resize")
																}
															/>
														)}
													</button>
												))}
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="grid min-h-96 place-items-center text-muted">
									{t.selectPreview}
								</div>
							)}
						</section>
						<aside className="border border-ink/15 bg-white p-5 lg:col-start-2 xl:col-start-3">
							<h2 className="border-b border-ink/15 pb-3 font-semibold">
								{t.annotations}
							</h2>
							<div className="mt-4 grid grid-cols-3 gap-2">
								<button
									type="button"
									className="tool-tile"
									onClick={() =>
										activePage &&
										addAnnotation({
											id: crypto.randomUUID(),
											type: "text",
											x: 40,
											y: 40,
											width: Math.min(240, activePage.width - 40),
											height: 48,
											text: t.annotationText,
											fontSize: 20,
											color: "#111111",
										})
									}
								>
									<Type size={20} />
									{t.addText}
								</button>
								<button
									type="button"
									className="tool-tile"
									onClick={() => imageInputRef.current?.click()}
								>
									<ImagePlus size={20} />
									{t.addImage}
								</button>
								<button
									type="button"
									className="tool-tile"
									onClick={() => setSignatureOpen(true)}
								>
									<Signature size={20} />
									{t.addSignature}
								</button>
							</div>
							<p className="mt-4 text-xs leading-relaxed text-muted">
								{t.dragHint}
							</p>
							{activeAnnotation && (
								<div className="mt-7 space-y-4 border-t border-ink/15 pt-5">
									<div className="flex items-center justify-between">
										<h3 className="font-semibold">{t.editAnnotation}</h3>
										<button
											type="button"
											className="icon-button text-primary"
											aria-label={t.removeAnnotation}
											onClick={() => {
												changePage(activePage.id, (page) => ({
													...page,
													annotations: page.annotations.filter(
														(item) => item.id !== activeAnnotation.id,
													),
												}));
												setActiveAnnotationId(null);
											}}
										>
											<X size={18} />
										</button>
									</div>
									{activeAnnotation.type === "text" && (
										<>
											<label className="tool-label">
												{t.textLabel}
												<textarea
													className="tool-input min-h-24"
													value={activeAnnotation.text}
													placeholder={t.textPlaceholder}
													onChange={(event) =>
														changeAnnotation(activeAnnotation.id, (item) =>
															item.type === "text"
																? { ...item, text: event.target.value }
																: item,
														)
													}
												/>
											</label>
											<label className="tool-label">
												{t.textSize}
												<input
													className="tool-input"
													type="number"
													min="8"
													max="96"
													value={activeAnnotation.fontSize}
													onChange={(event) =>
														changeAnnotation(activeAnnotation.id, (item) =>
															item.type === "text"
																? {
																		...item,
																		fontSize: Math.max(
																			8,
																			Math.min(
																				96,
																				Number(event.target.value) || 8,
																			),
																		),
																	}
																: item,
														)
													}
												/>
											</label>
											<label className="tool-label">
												{t.color}
												<input
													type="color"
													value={activeAnnotation.color}
													onChange={(event) =>
														changeAnnotation(activeAnnotation.id, (item) =>
															item.type === "text"
																? { ...item, color: event.target.value }
																: item,
														)
													}
												/>
											</label>
										</>
									)}
									<div className="grid grid-cols-2 gap-3">
										<label className="tool-label">
											{t.positionX}
											<input
												className="tool-input"
												type="number"
												min="0"
												max={Math.round(activePage.width)}
												value={Math.round(activeAnnotation.x)}
												onChange={(event) =>
													changeAnnotation(activeAnnotation.id, (item) => ({
														...item,
														x: Number(event.target.value) || 0,
													}))
												}
											/>
										</label>
										<label className="tool-label">
											{t.positionY}
											<input
												className="tool-input"
												type="number"
												min="0"
												max={Math.round(activePage.height)}
												value={Math.round(activeAnnotation.y)}
												onChange={(event) =>
													changeAnnotation(activeAnnotation.id, (item) => ({
														...item,
														y: Number(event.target.value) || 0,
													}))
												}
											/>
										</label>
										<label className="tool-label">
											{t.width}
											<input
												className="tool-input"
												type="number"
												min="20"
												max={Math.round(activePage.width)}
												value={Math.round(activeAnnotation.width)}
												onChange={(event) =>
													changeAnnotation(activeAnnotation.id, (item) => ({
														...item,
														width: Number(event.target.value) || 20,
													}))
												}
											/>
										</label>
										<label className="tool-label">
											{t.height}
											<input
												className="tool-input"
												type="number"
												min="20"
												max={Math.round(activePage.height)}
												value={Math.round(activeAnnotation.height)}
												onChange={(event) =>
													changeAnnotation(activeAnnotation.id, (item) => ({
														...item,
														height: Number(event.target.value) || 20,
													}))
												}
											/>
										</label>
									</div>
								</div>
							)}
						</aside>
					</div>
					<div className="mt-5 flex flex-wrap items-center justify-between gap-4 border border-ink/15 bg-white p-5">
						<p className="font-mono text-xs text-muted">
							{selectedCount} {t.selectedCount}{" "}
							<Check className="ml-1 inline text-primary" size={14} />
						</p>
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								className="tool-button"
								disabled={!selectedCount || !!busy}
								onClick={() => void save(true)}
							>
								<Download size={17} />
								{t.saveSelected}
							</button>
							<button
								type="button"
								className="tool-button tool-button-primary"
								disabled={!pages.length || !!busy}
								onClick={() => void save(false)}
							>
								<Download size={17} />
								{busy === "save" ? t.saving : t.saveAll}
							</button>
						</div>
					</div>
				</>
			)}
			{signatureOpen && (
				<SignaturePad
					onClose={() => setSignatureOpen(false)}
					onSave={(dataUrl) => {
						if (activePage)
							addAnnotation({
								id: crypto.randomUUID(),
								type: "signature",
								x: 40,
								y: 40,
								width: Math.min(240, activePage.width - 40),
								height: 75,
								dataUrl,
							});
						setSignatureOpen(false);
					}}
				/>
			)}
		</main>
	);
}
