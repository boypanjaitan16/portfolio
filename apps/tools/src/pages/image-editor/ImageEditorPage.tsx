import {
	ArrowLeft,
	Check,
	Crop,
	Download,
	FlipHorizontal2,
	FlipVertical2,
	ImagePlus,
	MapPin,
	RotateCcw,
	RotateCw,
	TriangleAlert,
} from "lucide-react";
import {
	type DragEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { Link } from "react-router-dom";
import { useToolsLocale } from "../../toolsLocale";
import { CropOverlay } from "./CropOverlay";
import {
	defaultQuality,
	downloadBlob,
	ExportError,
	type ExportErrorCode,
	type ExportFormat,
	exportFileName,
	exportFormats,
	exportImage,
	formatForFile,
	hasQuality,
} from "./imageExport";
import {
	type ImageMetadata,
	identifyingBlocks,
	type MetadataBlock,
	readImageMetadata,
} from "./imageMetadata";
import {
	type AspectPreset,
	angleMax,
	angleMin,
	aspectPresets,
	aspectRatio,
	type CropField,
	type CropRect,
	defaultCrop,
	drawTransformed,
	flipCrop,
	identityTransform,
	rotateVisually,
	setCropField,
	type Transform,
	transformedSize,
	visualAngle,
	withVisualAngle,
} from "./imageTransformModel";
import { useImageEditorTranslations } from "./locale";
import "./image-editor.css";

type LoadedImage = {
	name: string;
	width: number;
	height: number;
};
type ErrorCode = "invalidFile" | "invalidImage" | "tooLarge" | ExportErrorCode;
type DownloadStatus = { name: string; blocks: MetadataBlock[] };
type ImageEditorText = ReturnType<typeof useImageEditorTranslations>;

const acceptedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxFileBytes = 50 * 1024 * 1024;
const maxPixels = 50_000_000;
const formatLabels: Record<ExportFormat, string> = {
	"image/png": "PNG",
	"image/jpeg": "JPEG",
	"image/webp": "WebP",
};
const cropFields: { field: CropField; label: keyof ImageEditorText }[] = [
	{ field: "x", label: "cropX" },
	{ field: "y", label: "cropY" },
	{ field: "width", label: "cropWidth" },
	{ field: "height", label: "cropHeight" },
];

function acceptsImage(file: File): boolean {
	if (file.type) return acceptedTypes.has(file.type);
	return /\.(png|jpe?g|webp)$/i.test(file.name);
}

function fill(template: string, values: Record<string, string | number>) {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		key in values ? String(values[key]) : match,
	);
}

function aspectLabel(preset: AspectPreset, t: ImageEditorText): string {
	if (preset === "free") return t.aspect_free;
	if (preset === "original") return t.aspect_original;
	return preset;
}

/** A number input that lets users clear and retype without snapping back. */
function NumberField({
	label,
	value,
	min,
	max,
	step,
	onCommit,
}: {
	label: string;
	value: number;
	min?: number;
	max?: number;
	step?: number;
	onCommit: (value: number) => void;
}) {
	const [draft, setDraft] = useState<string | null>(null);
	return (
		<label className="tool-label">
			{label}
			<input
				type="number"
				inputMode="decimal"
				className="tool-input font-mono"
				value={draft ?? String(value)}
				min={min}
				max={max}
				step={step}
				onChange={(event) => {
					setDraft(event.target.value);
					const next = Number.parseFloat(event.target.value);
					if (Number.isFinite(next)) onCommit(next);
				}}
				onBlur={() => setDraft(null)}
			/>
		</label>
	);
}

function Panel({
	title,
	disabled,
	children,
}: {
	title: string;
	disabled: boolean;
	children: ReactNode;
}) {
	return (
		<section className="border border-ink/20 bg-white p-5">
			<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted">
				{title}
			</h2>
			<fieldset disabled={disabled} className="mt-4 min-w-0">
				<legend className="sr-only">{title}</legend>
				{children}
			</fieldset>
		</section>
	);
}

function MetadataSummary({
	metadata,
	t,
}: {
	metadata: ImageMetadata;
	t: ImageEditorText;
}) {
	if (metadata.blocks.length === 0)
		return <p className="text-sm text-muted">{t.noMetadata}</p>;
	return (
		<div className="grid gap-4 text-sm">
			{metadata.gps && (
				<p className="flex gap-2 border border-amber-300 bg-amber-50 p-3 text-amber-900">
					<MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
					{t.gpsWarning}
				</p>
			)}
			<p className="text-muted">{t.metadataFound}</p>
			<dl className="grid gap-2">
				{metadata.gps && (
					<div className="flex justify-between gap-3">
						<dt className="text-muted">{t.field_gps}</dt>
						<dd className="text-right font-mono font-semibold">
							{metadata.gps.latitude.toFixed(5)},{" "}
							{metadata.gps.longitude.toFixed(5)}
						</dd>
					</div>
				)}
				{metadata.fields.map((field) => (
					<div key={field.key} className="flex justify-between gap-3">
						<dt className="shrink-0 text-muted">{t[`field_${field.key}`]}</dt>
						<dd className="min-w-0 break-words text-right font-semibold">
							{field.value}
						</dd>
					</div>
				))}
				<div className="flex justify-between gap-3 border-t border-ink/10 pt-2">
					<dt className="shrink-0 text-muted">{t.blocksFound}</dt>
					<dd className="text-right font-semibold">
						{metadata.blocks.map((block) => t[`block_${block}`]).join(", ")}
					</dd>
				</div>
			</dl>
			<p className="border-t border-ink/10 pt-3 leading-relaxed text-muted">
				{t.removalNote}
			</p>
		</div>
	);
}

export function ImageEditorPage() {
	const { t: common } = useToolsLocale();
	const t = useImageEditorTranslations();
	const [image, setImage] = useState<LoadedImage | null>(null);
	const [transform, setTransform] = useState<Transform>(identityTransform);
	const [preset, setPreset] = useState<AspectPreset>("free");
	const [crop, setCrop] = useState<CropRect>({
		x: 0,
		y: 0,
		width: 1,
		height: 1,
	});
	const [format, setFormat] = useState<ExportFormat>("image/png");
	const [quality, setQuality] = useState(defaultQuality);
	const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
	const [error, setError] = useState<ErrorCode | null>(null);
	const [status, setStatus] = useState<DownloadStatus | null>(null);
	const [loading, setLoading] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const [previewBounds, setPreviewBounds] = useState({ width: 0, height: 0 });
	const inputRef = useRef<HTMLInputElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const previewAreaRef = useRef<HTMLFieldSetElement>(null);
	const bitmapRef = useRef<ImageBitmap | null>(null);
	const loadingIdRef = useRef(0);

	const bounds = image ? transformedSize(image, transform) : null;
	const ratio = image ? aspectRatio(preset, image, transform) : null;
	const scale =
		bounds && previewBounds.width > 0
			? Math.min(
					previewBounds.width / bounds.width,
					previewBounds.height / bounds.height,
				)
			: null;

	useEffect(() => {
		document.title = `${t.title} | Boy Boni Panjaitan`;
	}, [t.title]);
	useEffect(
		() => () => {
			loadingIdRef.current += 1;
			bitmapRef.current?.close();
			bitmapRef.current = null;
		},
		[],
	);
	useEffect(() => {
		if (!image) return;
		const area = previewAreaRef.current;
		if (!area) return;
		const updateBounds = () => {
			const style = window.getComputedStyle(area);
			const width =
				area.clientWidth -
				(Number.parseFloat(style.paddingLeft) || 0) -
				(Number.parseFloat(style.paddingRight) || 0);
			setPreviewBounds({
				width: Math.max(1, width),
				height: Math.max(240, Math.min(window.innerHeight * 0.7, 760)),
			});
		};
		updateBounds();
		const observer =
			"ResizeObserver" in window ? new ResizeObserver(updateBounds) : null;
		observer?.observe(area);
		window.addEventListener("resize", updateBounds);
		return () => {
			observer?.disconnect();
			window.removeEventListener("resize", updateBounds);
		};
	}, [image]);
	useEffect(() => {
		const canvas = canvasRef.current;
		const bitmap = bitmapRef.current;
		if (!canvas || !bitmap || !image || !scale) return;
		const size = transformedSize(image, transform);
		const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.max(1, Math.round(size.width * scale * pixelRatio));
		canvas.height = Math.max(1, Math.round(size.height * scale * pixelRatio));
		const context = canvas.getContext("2d");
		if (!context) return;
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.setTransform(
			canvas.width / size.width,
			0,
			0,
			canvas.height / size.height,
			0,
			0,
		);
		context.imageSmoothingEnabled = true;
		context.imageSmoothingQuality = "high";
		drawTransformed(context, bitmap, image, transform, { x: 0, y: 0 });
	}, [image, transform, scale]);

	async function loadImage(file: File) {
		const loadingId = ++loadingIdRef.current;
		setError(null);
		setStatus(null);
		if (!acceptsImage(file)) {
			setLoading(false);
			setError("invalidFile");
			return;
		}
		if (file.size > maxFileBytes) {
			setLoading(false);
			setError("tooLarge");
			return;
		}
		setLoading(true);
		let bitmap: ImageBitmap | null = null;
		try {
			// Apply the EXIF orientation so the preview starts upright.
			bitmap = await createImageBitmap(file, {
				imageOrientation: "from-image",
			});
			if (loadingId !== loadingIdRef.current) return;
			if (bitmap.width < 1 || bitmap.height < 1) throw new Error("size");
			if (bitmap.width * bitmap.height > maxPixels) {
				setError("tooLarge");
				return;
			}
			const size = { width: bitmap.width, height: bitmap.height };
			bitmapRef.current?.close();
			bitmapRef.current = bitmap;
			bitmap = null;
			setImage({ name: file.name, ...size });
			setTransform(identityTransform);
			setPreset("free");
			setCrop(defaultCrop(size, identityTransform, "free"));
			setFormat(formatForFile(file));
			setMetadata(null);
			const found = readImageMetadata(await file.arrayBuffer());
			if (loadingId === loadingIdRef.current) setMetadata(found);
		} catch {
			if (loadingId === loadingIdRef.current) setError("invalidImage");
		} finally {
			bitmap?.close();
			if (loadingId === loadingIdRef.current) setLoading(false);
		}
	}

	function changeTransform(next: Transform) {
		if (!image) return;
		setTransform(next);
		setCrop(defaultCrop(image, next, preset));
		setStatus(null);
	}

	function flip(axis: "x" | "y") {
		if (!bounds) return;
		setTransform((current) =>
			axis === "x"
				? { ...current, flipX: !current.flipX }
				: { ...current, flipY: !current.flipY },
		);
		setCrop(flipCrop(crop, axis, bounds));
		setStatus(null);
	}

	function changePreset(next: AspectPreset) {
		if (!image) return;
		setPreset(next);
		setCrop(defaultCrop(image, transform, next));
		setStatus(null);
	}

	function changeCrop(next: CropRect) {
		setCrop(next);
		setStatus(null);
	}

	async function download() {
		const bitmap = bitmapRef.current;
		if (!image || !bitmap) return;
		setDownloading(true);
		setError(null);
		setStatus(null);
		try {
			const blob = await exportImage(
				bitmap,
				image,
				transform,
				crop,
				format,
				quality,
			);
			const name = exportFileName(image.name, format);
			downloadBlob(blob, name);
			const check = readImageMetadata(await blob.arrayBuffer());
			setStatus({
				name,
				blocks: check.blocks.filter((block) =>
					identifyingBlocks.includes(block),
				),
			});
		} catch (exportError) {
			setError(
				exportError instanceof ExportError ? exportError.code : "exportFailed",
			);
		} finally {
			setDownloading(false);
		}
	}

	function handleDrop(event: DragEvent<HTMLFieldSetElement>) {
		event.preventDefault();
		setDragActive(false);
		const file = event.dataTransfer.files[0];
		if (file) void loadImage(file);
	}

	const disabled = !image || loading;
	const angle = visualAngle(transform);

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
					onClick={() => inputRef.current?.click()}
				>
					<ImagePlus size={18} aria-hidden="true" />
					{image ? t.replaceImage : t.chooseImage}
				</button>
			</div>
			<input
				ref={inputRef}
				type="file"
				accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
				aria-label={t.chooseImage}
				className="sr-only"
				onChange={(event) => {
					const file = event.target.files?.[0];
					if (file) void loadImage(file);
					event.target.value = "";
				}}
			/>
			{error && (
				<p
					role="alert"
					className="mt-6 border border-red-300 bg-red-50 p-4 text-sm text-red-800"
				>
					{t[error]}
				</p>
			)}
			<div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
				<section className="min-w-0 border border-ink/20 bg-white">
					<div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/15 px-5 py-4">
						<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">
							{t.preview}
						</h2>
						{image && (
							<span className="min-w-0 truncate font-mono text-xs text-muted">
								{fill(t.imageDetails, image)}
							</span>
						)}
					</div>
					<fieldset
						ref={previewAreaRef}
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
						className={`min-w-0 p-5 md:p-8 ${image ? "" : "min-h-80"} ${dragActive ? "bg-primary/10" : "bg-paper/70"}`}
					>
						<legend className="sr-only">{t.preview}</legend>
						{!image && (
							<div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-ink/30 px-5 text-center">
								<Crop
									size={38}
									strokeWidth={1.4}
									className="text-primary"
									aria-hidden="true"
								/>
								<p className="mt-5 text-xl font-semibold">
									{loading ? t.loading : t.emptyTitle}
								</p>
								<p className="mt-2 text-sm text-muted">{t.emptyDescription}</p>
								<p className="mt-5 font-mono text-xs text-muted">
									{t.dropHint} · {t.formats}
								</p>
							</div>
						)}
						{image && bounds && (
							<div className="text-center">
								<div
									className="image-editor-checkerboard relative inline-block max-w-full overflow-hidden align-top"
									style={
										scale
											? {
													width: bounds.width * scale,
													height: bounds.height * scale,
												}
											: undefined
									}
								>
									<canvas ref={canvasRef} className="block h-full w-full" />
									{scale && (
										<CropOverlay
											crop={crop}
											bounds={bounds}
											scale={scale}
											ratio={ratio}
											label={t.cropArea}
											describedBy="image-editor-instructions"
											onChange={changeCrop}
										/>
									)}
								</div>
							</div>
						)}
					</fieldset>
					<p
						id="image-editor-instructions"
						className="border-t border-ink/15 px-5 py-4 text-sm text-muted"
					>
						{image ? t.instructions : t.formats}
					</p>
				</section>
				<div className="grid min-w-0 gap-4">
					<Panel title={t.rotateTitle} disabled={disabled}>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								className="tool-button"
								onClick={() => changeTransform(rotateVisually(transform, -1))}
							>
								<RotateCcw size={15} aria-hidden="true" />
								{t.rotateLeft}
							</button>
							<button
								type="button"
								className="tool-button"
								onClick={() => changeTransform(rotateVisually(transform, 1))}
							>
								<RotateCw size={15} aria-hidden="true" />
								{t.rotateRight}
							</button>
							<button
								type="button"
								className="tool-button"
								aria-pressed={transform.flipX}
								onClick={() => flip("x")}
							>
								<FlipHorizontal2 size={15} aria-hidden="true" />
								{t.flipHorizontal}
							</button>
							<button
								type="button"
								className="tool-button"
								aria-pressed={transform.flipY}
								onClick={() => flip("y")}
							>
								<FlipVertical2 size={15} aria-hidden="true" />
								{t.flipVertical}
							</button>
						</div>
						<label className="tool-label mt-5">
							{t.straighten}
							<input
								type="range"
								min={angleMin}
								max={angleMax}
								step={0.5}
								value={angle}
								className="accent-primary"
								onChange={(event) =>
									changeTransform(
										withVisualAngle(transform, Number(event.target.value)),
									)
								}
							/>
						</label>
						<div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
							<NumberField
								label={t.angle}
								value={angle}
								min={angleMin}
								max={angleMax}
								step={0.1}
								onCommit={(value) =>
									changeTransform(
										withVisualAngle(transform, Math.round(value * 10) / 10),
									)
								}
							/>
							<button
								type="button"
								className="tool-button"
								disabled={
									transform.quarterTurns === 0 &&
									!transform.flipX &&
									!transform.flipY &&
									transform.angle === 0
								}
								onClick={() => changeTransform(identityTransform)}
							>
								{t.resetRotation}
							</button>
						</div>
					</Panel>
					<Panel title={t.cropTitle} disabled={disabled}>
						<p className="tool-label">{t.aspectRatio}</p>
						<div className="mt-2 grid grid-cols-3 gap-2">
							{aspectPresets.map((option) => (
								<button
									key={option}
									type="button"
									aria-pressed={preset === option}
									className={`tool-button px-2 ${preset === option ? "tool-button-primary" : ""}`}
									onClick={() => changePreset(option)}
								>
									{aspectLabel(option, t)}
								</button>
							))}
						</div>
						<div className="mt-4 grid grid-cols-2 gap-3">
							{cropFields.map(({ field, label }) => (
								<NumberField
									key={field}
									label={t[label]}
									value={crop[field]}
									min={field === "x" || field === "y" ? 0 : 1}
									step={1}
									onCommit={(value) => {
										if (bounds)
											changeCrop(
												setCropField(crop, field, value, bounds, ratio),
											);
									}}
								/>
							))}
						</div>
						<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
							<p className="font-mono text-xs text-muted">
								{fill(t.outputSize, crop)}
							</p>
							<button
								type="button"
								className="tool-button"
								onClick={() => changePreset(preset)}
							>
								{t.resetCrop}
							</button>
						</div>
					</Panel>
					<section className="border border-ink/20 bg-white p-5">
						<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted">
							{t.metadataTitle}
						</h2>
						<div className="mt-4">
							{!image ? (
								<p className="text-sm text-muted">{t.emptyDescription}</p>
							) : metadata ? (
								<MetadataSummary metadata={metadata} t={t} />
							) : (
								<p className="text-sm text-muted">{t.readingMetadata}</p>
							)}
						</div>
					</section>
					<Panel title={t.downloadTitle} disabled={disabled || downloading}>
						<div className="grid gap-4">
							<label className="tool-label">
								{t.format}
								<select
									className="tool-input"
									value={format}
									onChange={(event) => {
										setFormat(event.target.value as ExportFormat);
										setStatus(null);
									}}
								>
									{exportFormats.map((option) => (
										<option key={option} value={option}>
											{formatLabels[option]}
										</option>
									))}
								</select>
							</label>
							{hasQuality(format) && (
								<label className="tool-label">
									<span className="flex justify-between">
										{t.quality}
										<span className="font-mono">{quality}%</span>
									</span>
									<input
										type="range"
										min={10}
										max={100}
										step={1}
										value={quality}
										className="accent-primary"
										onChange={(event) => {
											setQuality(Number(event.target.value));
											setStatus(null);
										}}
									/>
								</label>
							)}
							{format === "image/jpeg" && (
								<p className="text-xs leading-relaxed text-muted">
									{t.jpegNote}
								</p>
							)}
							<button
								type="button"
								className="tool-button tool-button-primary"
								onClick={() => void download()}
							>
								<Download size={16} aria-hidden="true" />
								{downloading ? t.downloading : t.download}
							</button>
						</div>
					</Panel>
					<p role="status" className="min-h-5 text-sm">
						{status &&
							(status.blocks.length === 0 ? (
								<span className="text-primary">
									<Check size={15} className="mr-1 inline" aria-hidden="true" />
									{fill(t.downloadClean, { name: status.name })}
								</span>
							) : (
								<span className="text-amber-800">
									<TriangleAlert
										size={15}
										className="mr-1 inline"
										aria-hidden="true"
									/>
									{fill(t.downloadWarning, {
										name: status.name,
										blocks: status.blocks
											.map((block) => t[`block_${block}`])
											.join(", "),
									})}
								</span>
							))}
					</p>
				</div>
			</div>
		</main>
	);
}
