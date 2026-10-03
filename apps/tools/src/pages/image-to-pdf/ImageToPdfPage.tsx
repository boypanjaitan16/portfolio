import {
	ArrowDown,
	ArrowLeft,
	ArrowUp,
	Download,
	FileImage,
	ImagePlus,
	Trash2,
} from "lucide-react";
import { type DragEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { downloadBlob } from "../../shared/download";
import { imageAccept } from "../../shared/imageFiles";
import { useToolsLocale } from "../../toolsLocale";
import { useImageToPdfTranslations } from "./locale";
import {
	ConversionError,
	imagesToPdf,
	inspectImage,
	maxItems,
	type PageSize,
} from "./pdfConversion";

type Item = {
	id: number;
	file: File;
	previewUrl: string;
	width: number;
	height: number;
};

type Text = ReturnType<typeof useImageToPdfTranslations>;

function fill(template: string, values: Record<string, string | number>) {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		key in values ? String(values[key]) : match,
	);
}

function errorText(error: ConversionError, t: Text): string {
	if (error.code === "createFailed")
		return error.fileName
			? fill(t.fileFailed, { name: error.fileName })
			: t.createFailed;
	return fill(t[error.code], { name: error.fileName ?? "" });
}

export function ImageToPdfPage() {
	const { t: common } = useToolsLocale();
	const t = useImageToPdfTranslations();
	const [items, setItems] = useState<Item[]>([]);
	const [pageSize, setPageSize] = useState<PageSize>("a4");
	const [busy, setBusy] = useState<"adding" | "creating" | null>(null);
	const [notices, setNotices] = useState<string[]>([]);
	const [dragActive, setDragActive] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const itemsRef = useRef<Item[]>([]);
	const busyRef = useRef(false);
	const runIdRef = useRef(0);
	const nextIdRef = useRef(1);
	itemsRef.current = items;

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

	async function addFiles(files: File[]) {
		if (files.length === 0 || busyRef.current) return;
		busyRef.current = true;
		setBusy("adding");
		const runId = runIdRef.current;
		const added: Item[] = [];
		const errors: string[] = [];
		let tooMany = false;
		try {
			for (const file of files) {
				if (itemsRef.current.length + added.length >= maxItems) {
					tooMany = true;
					continue;
				}
				try {
					const info = await inspectImage(file);
					if (runId !== runIdRef.current) return;
					added.push({
						id: nextIdRef.current++,
						file,
						previewUrl: URL.createObjectURL(file),
						...info,
					});
				} catch (error) {
					if (runId !== runIdRef.current) return;
					errors.push(
						errorText(
							error instanceof ConversionError
								? error
								: new ConversionError("invalidImage", file.name),
							t,
						),
					);
				}
			}
			if (runId !== runIdRef.current) return;
			if (tooMany) errors.push(t.tooMany);
			setNotices(errors);
			if (added.length > 0) {
				const next = [...itemsRef.current, ...added];
				itemsRef.current = next;
				setItems(next);
			}
		} finally {
			if (runId !== runIdRef.current) {
				for (const item of added) URL.revokeObjectURL(item.previewUrl);
			} else {
				busyRef.current = false;
				setBusy(null);
			}
		}
	}

	function replaceItems(next: Item[]) {
		itemsRef.current = next;
		setItems(next);
	}

	function removeItem(id: number) {
		const item = itemsRef.current.find((candidate) => candidate.id === id);
		if (item) URL.revokeObjectURL(item.previewUrl);
		replaceItems(itemsRef.current.filter((candidate) => candidate.id !== id));
	}

	function moveItem(index: number, direction: -1 | 1) {
		const target = index + direction;
		if (target < 0 || target >= itemsRef.current.length) return;
		const next = [...itemsRef.current];
		[next[index], next[target]] = [next[target], next[index]];
		replaceItems(next);
	}

	function clearAll() {
		for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl);
		replaceItems([]);
		setNotices([]);
	}

	async function createPdf() {
		if (busyRef.current || itemsRef.current.length === 0) return;
		busyRef.current = true;
		setBusy("creating");
		setNotices([]);
		const runId = runIdRef.current;
		try {
			const bytes = await imagesToPdf(
				itemsRef.current.map((item) => item.file),
				pageSize,
			);
			if (runId !== runIdRef.current) return;
			downloadBlob(
				new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
				"images-to-pdf.pdf",
			);
		} catch (error) {
			if (runId !== runIdRef.current) return;
			setNotices([
				error instanceof ConversionError ? errorText(error, t) : t.createFailed,
			]);
		} finally {
			if (runId === runIdRef.current) {
				busyRef.current = false;
				setBusy(null);
			}
		}
	}

	function handleDrop(event: DragEvent<HTMLElement>) {
		event.preventDefault();
		setDragActive(false);
		void addFiles([...event.dataTransfer.files]);
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
					disabled={busy !== null || items.length >= maxItems}
					onClick={() => inputRef.current?.click()}
				>
					<ImagePlus size={18} aria-hidden="true" />
					{busy === "adding"
						? t.adding
						: items.length > 0
							? t.addImages
							: t.chooseImages}
				</button>
			</div>
			<input
				ref={inputRef}
				type="file"
				multiple
				accept={imageAccept}
				aria-label={t.chooseImages}
				className="sr-only"
				disabled={busy !== null}
				onChange={(event) => {
					void addFiles([...(event.target.files ?? [])]);
					event.target.value = "";
				}}
			/>
			{notices.length > 0 && (
				<div
					role="alert"
					className="mt-6 grid gap-1 border border-red-300 bg-red-50 p-4 text-sm text-red-800"
				>
					{notices.map((notice, index) => (
						<p key={`${index}-${notice}`}>{notice}</p>
					))}
				</div>
			)}
			<div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
				<section className="min-w-0 border border-ink/20 bg-white">
					<div className="flex items-center justify-between gap-2 border-b border-ink/15 px-5 py-4">
						<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">
							{t.images}
						</h2>
						<span className="font-mono text-xs text-muted">
							{fill(t.imageCount, { count: items.length, max: maxItems })}
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
						<legend className="sr-only">{t.images}</legend>
						{items.length === 0 ? (
							<div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-ink/30 px-5 text-center">
								<FileImage
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
								{items.map((item, index) => (
									<li
										key={item.id}
										className="flex flex-wrap items-center gap-4 border border-ink/15 bg-white p-3"
									>
										<span className="w-6 text-center font-mono text-xs text-muted">
											{index + 1}
										</span>
										<img
											src={item.previewUrl}
											alt=""
											className="h-16 w-16 shrink-0 border border-ink/10 object-contain"
										/>
										<div className="min-w-0 flex-1 text-sm">
											<p className="truncate font-semibold">{item.file.name}</p>
											<p className="mt-1 font-mono text-xs text-muted">
												{fill(t.imageDimensions, {
													width: item.width,
													height: item.height,
												})}
											</p>
										</div>
										<div className="flex gap-2">
											<button
												type="button"
												className="tool-button px-3"
												aria-label={`${t.moveUp} ${item.file.name}`}
												disabled={busy !== null || index === 0}
												onClick={() => moveItem(index, -1)}
											>
												<ArrowUp size={16} aria-hidden="true" />
											</button>
											<button
												type="button"
												className="tool-button px-3"
												aria-label={`${t.moveDown} ${item.file.name}`}
												disabled={busy !== null || index === items.length - 1}
												onClick={() => moveItem(index, 1)}
											>
												<ArrowDown size={16} aria-hidden="true" />
											</button>
											<button
												type="button"
												className="tool-button px-3"
												aria-label={`${t.remove} ${item.file.name}`}
												disabled={busy !== null}
												onClick={() => removeItem(item.id)}
											>
												<Trash2 size={16} aria-hidden="true" />
											</button>
										</div>
									</li>
								))}
							</ul>
						)}
					</fieldset>
					{items.length > 0 && (
						<div className="flex justify-end border-t border-ink/15 px-5 py-4">
							<button
								type="button"
								className="tool-button"
								disabled={busy !== null}
								onClick={clearAll}
							>
								{t.clearAll}
							</button>
						</div>
					)}
				</section>
				<section className="border border-ink/20 bg-white p-6">
					<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">
						{t.settings}
					</h2>
					<label
						htmlFor="image-to-pdf-size"
						className="mt-7 block text-sm font-semibold"
					>
						{t.pageSize}
					</label>
					<select
						id="image-to-pdf-size"
						className="mt-2 w-full border border-ink/25 bg-white px-3 py-3 text-sm"
						value={pageSize}
						disabled={busy !== null}
						onChange={(event) => setPageSize(event.target.value as PageSize)}
					>
						<option value="a4">{t.sizeA4}</option>
						<option value="letter">{t.sizeLetter}</option>
						<option value="image">{t.sizeImage}</option>
					</select>
					<p className="mt-3 text-sm leading-relaxed text-muted">
						{t.layoutHint}
					</p>
					<button
						type="button"
						className="tool-button tool-button-primary mt-8 w-full justify-center"
						disabled={busy !== null || items.length === 0}
						onClick={() => void createPdf()}
					>
						<Download size={18} aria-hidden="true" />
						{busy === "creating" ? t.creating : t.create}
					</button>
					<p className="mt-3 text-sm leading-relaxed text-muted">
						{t.outputHint}
					</p>
				</section>
			</div>
		</main>
	);
}
