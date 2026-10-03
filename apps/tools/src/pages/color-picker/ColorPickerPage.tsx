import { ArrowLeft, Check, Copy, ImagePlus, Pipette } from "lucide-react";
import {
	type DragEvent,
	type KeyboardEvent,
	type PointerEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { Link } from "react-router-dom";
import { useToolsLocale } from "../../toolsLocale";
import {
	colorHex,
	colorRgb,
	imagePointFromClient,
	opacityPercent,
	type Pixel,
} from "./colorPickerModel";
import { useColorPickerTranslations } from "./locale";
import "./color-picker.css";

type LoadedImage = { name: string; width: number; height: number };
type ErrorCode = "invalidFile" | "invalidImage" | "readError";
type CopyStatus = "hex" | "rgb" | "error" | null;
type ColorPickerText = ReturnType<typeof useColorPickerTranslations>;

const acceptedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

function acceptsImage(file: File): boolean {
	if (file.type) return acceptedTypes.has(file.type);
	return /\.(png|jpe?g|webp)$/i.test(file.name);
}

async function copyText(value: string): Promise<void> {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(value);
			return;
		}
	} catch {
		// A browser can deny Clipboard API access even after a user action.
	}
	const previouslyFocused =
		document.activeElement instanceof HTMLElement
			? document.activeElement
			: null;
	const input = document.createElement("textarea");
	input.value = value;
	input.readOnly = true;
	input.style.position = "fixed";
	input.style.left = "-9999px";
	document.body.append(input);
	let copied = false;
	try {
		input.select();
		copied = document.execCommand?.("copy") ?? false;
	} finally {
		input.remove();
		previouslyFocused?.focus();
	}
	if (!copied) throw new Error("copy");
}

function ColorReadout({
	label,
	placeholder,
	pixel,
	t,
	onCopy,
}: {
	label: string;
	placeholder: string;
	pixel: Pixel | null;
	t: ColorPickerText;
	onCopy?: (format: "hex" | "rgb") => void;
}) {
	const hasColor = pixel !== null && pixel.a > 0;
	return (
		<section className="border border-ink/20 bg-white p-5">
			<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted">
				{label}
			</h2>
			{pixel ? (
				<>
					<div className="mt-4 flex items-center gap-4">
						<div className="color-picker-checkerboard h-16 w-16 shrink-0 overflow-hidden border border-ink/20">
							<div
								className="h-full w-full"
								style={{
									backgroundColor: `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a / 255})`,
								}}
							/>
						</div>
						<div>
							<p className="font-mono text-xs text-muted">
								{t.pixelPosition
									.replace("{x}", String(pixel.x + 1))
									.replace("{y}", String(pixel.y + 1))}
							</p>
							<p className="mt-1 text-lg font-semibold">
								{hasColor ? colorHex(pixel) : t.transparent}
							</p>
						</div>
					</div>
					<dl className="mt-5 grid gap-3 border-t border-ink/10 pt-4 text-sm">
						{hasColor && (
							<>
								<div className="flex items-center justify-between gap-3">
									<dt className="text-muted">{t.hex}</dt>
									<dd className="font-mono font-semibold">{colorHex(pixel)}</dd>
								</div>
								<div className="flex items-center justify-between gap-3">
									<dt className="text-muted">{t.rgb}</dt>
									<dd className="font-mono font-semibold">{colorRgb(pixel)}</dd>
								</div>
							</>
						)}
						<div className="flex items-center justify-between gap-3">
							<dt className="text-muted">{t.opacity}</dt>
							<dd className="font-mono font-semibold">
								{opacityPercent(pixel)}
							</dd>
						</div>
					</dl>
					{hasColor && onCopy && (
						<div className="mt-5 grid grid-cols-2 gap-2">
							<button
								type="button"
								className="tool-button"
								onClick={() => onCopy("hex")}
							>
								<Copy size={15} aria-hidden="true" />
								{t.copyHex}
							</button>
							<button
								type="button"
								className="tool-button"
								onClick={() => onCopy("rgb")}
							>
								<Copy size={15} aria-hidden="true" />
								{t.copyRgb}
							</button>
						</div>
					)}
				</>
			) : (
				<p className="mt-5 text-sm leading-relaxed text-muted">{placeholder}</p>
			)}
		</section>
	);
}

export function ColorPickerPage() {
	const { t: common } = useToolsLocale();
	const t = useColorPickerTranslations();
	const [image, setImage] = useState<LoadedImage | null>(null);
	const [hovered, setHovered] = useState<Pixel | null>(null);
	const [selected, setSelected] = useState<Pixel | null>(null);
	const [error, setError] = useState<ErrorCode | null>(null);
	const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
	const [loading, setLoading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const [previewBounds, setPreviewBounds] = useState({ width: 0, height: 0 });
	const inputRef = useRef<HTMLInputElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const previewAreaRef = useRef<HTMLFieldSetElement>(null);
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
	const loadingIdRef = useRef(0);
	const pointerDownRef = useRef(false);
	const selectedRef = useRef<Pixel | null>(null);
	const hoveredRef = useRef<Pixel | null>(null);

	useEffect(() => {
		document.title = `${t.title} | Boy Boni Panjaitan`;
	}, [t.title]);
	useEffect(
		() => () => {
			loadingIdRef.current += 1;
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

	function setHover(pixel: Pixel | null) {
		hoveredRef.current = pixel;
		setHovered(pixel);
	}

	function setSelection(pixel: Pixel | null) {
		selectedRef.current = pixel;
		setSelected(pixel);
		setCopyStatus(null);
	}

	async function loadImage(file: File) {
		const loadingId = ++loadingIdRef.current;
		setError(null);
		setCopyStatus(null);
		if (!acceptsImage(file)) {
			setLoading(false);
			setError("invalidFile");
			return;
		}
		setLoading(true);
		let bitmap: ImageBitmap | null = null;
		try {
			bitmap = await createImageBitmap(file);
			if (loadingId !== loadingIdRef.current) return;
			if (bitmap.width < 1 || bitmap.height < 1) throw new Error("size");
			const candidate = document.createElement("canvas");
			candidate.width = bitmap.width;
			candidate.height = bitmap.height;
			const candidateContext = candidate.getContext("2d", {
				colorSpace: "srgb",
				willReadFrequently: true,
			});
			if (!candidateContext) throw new Error("context");
			candidateContext.drawImage(bitmap, 0, 0);
			candidateContext.getImageData(0, 0, 1, 1);
			if (loadingId !== loadingIdRef.current) return;
			const canvas = canvasRef.current;
			if (!canvas) throw new Error("canvas");
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;
			const context = canvas.getContext("2d", {
				colorSpace: "srgb",
				willReadFrequently: true,
			});
			if (!context) throw new Error("context");
			context.drawImage(candidate, 0, 0);
			contextRef.current = context;
			setImage({ name: file.name, width: bitmap.width, height: bitmap.height });
			setHover(null);
			setSelection(null);
			setError(null);
		} catch {
			if (loadingId === loadingIdRef.current) setError("invalidImage");
		} finally {
			bitmap?.close();
			if (loadingId === loadingIdRef.current) setLoading(false);
		}
	}

	function samplePixel(x: number, y: number): Pixel | null {
		try {
			const data = contextRef.current?.getImageData(x, y, 1, 1).data;
			if (!data) return null;
			const pixel = { x, y, r: data[0], g: data[1], b: data[2], a: data[3] };
			setHover(pixel);
			return pixel;
		} catch {
			setError("readError");
			return null;
		}
	}

	function samplePointer(event: PointerEvent<HTMLButtonElement>): Pixel | null {
		const canvas = canvasRef.current;
		if (!canvas || !image) return null;
		const point = imagePointFromClient(
			event.clientX,
			event.clientY,
			canvas.getBoundingClientRect(),
			image.width,
			image.height,
		);
		return point ? samplePixel(point.x, point.y) : null;
	}

	function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
		if (event.pointerType === "mouse" && event.button !== 0) return;
		pointerDownRef.current = true;
		event.currentTarget.setPointerCapture?.(event.pointerId);
		samplePointer(event);
	}

	function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
		if (!pointerDownRef.current) return;
		pointerDownRef.current = false;
		setSelection(samplePointer(event) ?? hoveredRef.current);
		if (event.currentTarget.hasPointerCapture?.(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
		if (!image) return;
		const changes: Record<string, [number, number]> = {
			ArrowLeft: [-1, 0],
			ArrowRight: [1, 0],
			ArrowUp: [0, -1],
			ArrowDown: [0, 1],
		};
		if (event.key in changes) {
			event.preventDefault();
			const [dx, dy] = changes[event.key];
			const current = hoveredRef.current ??
				selectedRef.current ?? {
					x: Math.floor(image.width / 2),
					y: Math.floor(image.height / 2),
				};
			samplePixel(
				Math.max(0, Math.min(image.width - 1, current.x + dx)),
				Math.max(0, Math.min(image.height - 1, current.y + dy)),
			);
		} else if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			const pixel =
				hoveredRef.current ??
				samplePixel(Math.floor(image.width / 2), Math.floor(image.height / 2));
			if (pixel) setSelection(pixel);
		}
	}

	async function copyColor(format: "hex" | "rgb") {
		if (!selected || selected.a === 0) return;
		try {
			await copyText(
				format === "hex" ? colorHex(selected) : colorRgb(selected),
			);
			setCopyStatus(format);
		} catch {
			setCopyStatus("error");
		}
	}

	function handleDrop(event: DragEvent<HTMLFieldSetElement>) {
		event.preventDefault();
		setDragActive(false);
		const file = event.dataTransfer.files[0];
		if (file) void loadImage(file);
	}

	const marker = hovered ?? selected;
	const displayScale =
		image && previewBounds.width > 0
			? Math.min(
					previewBounds.width / image.width,
					previewBounds.height / image.height,
				)
			: null;
	const copyFeedback =
		copyStatus === "hex"
			? t.copiedHex
			: copyStatus === "rgb"
				? t.copiedRgb
				: copyStatus === "error"
					? t.copyError
					: "";

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
								{t.imageDetails.replace(
									/\{(name|width|height)\}/g,
									(_, key) => {
										if (key === "name") return image.name;
										return String(key === "width" ? image.width : image.height);
									},
								)}
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
								<Pipette
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
						<div className={image ? "text-center" : "hidden"}>
							<button
								type="button"
								aria-label={t.imageCanvas}
								aria-describedby="color-picker-instructions"
								className="color-picker-checkerboard relative inline-block max-w-full touch-none cursor-crosshair border border-ink/20 p-0 align-top focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								onPointerEnter={samplePointer}
								onPointerMove={samplePointer}
								onPointerDown={handlePointerDown}
								onPointerUp={handlePointerUp}
								onPointerCancel={() => {
									pointerDownRef.current = false;
								}}
								onPointerLeave={() => {
									if (!pointerDownRef.current) setHover(null);
								}}
								onKeyDown={handleKeyDown}
								onBlur={() => setHover(null)}
							>
								<canvas
									ref={canvasRef}
									className="block max-w-full"
									style={
										displayScale && image
											? {
													width: image.width * displayScale,
													height: image.height * displayScale,
													imageRendering:
														displayScale > 1.5 ? "pixelated" : "auto",
												}
											: undefined
									}
								/>
								{marker && image && (
									<span
										aria-hidden="true"
										className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_#111]"
										style={{
											left: `${((marker.x + 0.5) / image.width) * 100}%`,
											top: `${((marker.y + 0.5) / image.height) * 100}%`,
										}}
									/>
								)}
							</button>
						</div>
					</fieldset>
					<p
						id="color-picker-instructions"
						className="border-t border-ink/15 px-5 py-4 text-sm text-muted"
					>
						{image ? t.instructions : t.formats}
					</p>
				</section>
				<div className="grid min-w-0 gap-4">
					<ColorReadout
						label={t.hoverColor}
						placeholder={t.hoverPlaceholder}
						pixel={hovered}
						t={t}
					/>
					<ColorReadout
						label={t.selectedColor}
						placeholder={t.selectedPlaceholder}
						pixel={selected}
						t={t}
						onCopy={(format) => void copyColor(format)}
					/>
					<p role="status" className="min-h-5 text-sm text-primary">
						{copyFeedback && (
							<>
								{copyStatus !== "error" && (
									<Check size={15} className="mr-1 inline" aria-hidden="true" />
								)}
								{copyFeedback}
							</>
						)}
					</p>
				</div>
			</div>
		</main>
	);
}
