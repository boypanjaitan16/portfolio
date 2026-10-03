import {
	ArrowLeft,
	ChevronDown,
	PartyPopper,
	Pencil,
	Plus,
	RotateCw,
	Trash2,
} from "lucide-react";
import {
	type CSSProperties,
	type FormEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { Link } from "react-router-dom";
import { useToolsLocale } from "../../toolsLocale";
import { useSpinningWheelTranslations } from "./locale";
import {
	addWheelItems,
	normalizedLabel,
	parseStoredWheelItems,
	randomWheelIndex,
	targetWheelRotation,
	type WheelItem,
	wheelStorageKey,
	wheelTextColor,
} from "./wheelModel";
import "./spinning-wheel.css";

const spinDuration = 4800;
const confettiColors = ["#e60023", "#e6a23c", "#74a876", "#5b91b2", "#9672b5"];

function WinnerDialog({
	winner,
	title,
	description,
	confirmLabel,
	onConfirm,
}: {
	winner: WheelItem;
	title: string;
	description: string;
	confirmLabel: string;
	onConfirm: () => void;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const confirmButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		if (!dialog.open) dialog.showModal();
		confirmButtonRef.current?.focus();
		return () => {
			if (dialog.open) dialog.close();
			document.body.style.overflow = previousOverflow;
		};
	}, []);

	return (
		<dialog
			ref={dialogRef}
			className="spinning-wheel-result-dialog"
			aria-labelledby="spinning-wheel-winner-title"
			aria-describedby="spinning-wheel-winner-description"
			onCancel={(event) => event.preventDefault()}
		>
			<div className="spinning-wheel-confetti" aria-hidden="true">
				{Array.from({ length: 36 }, (_, index) => (
					<span
						key={index}
						className="spinning-wheel-confetti-piece"
						style={
							{
								"--confetti-x": `${(index * 37) % 100}%`,
								"--confetti-y": `${(index * 29) % 88}%`,
								"--confetti-delay": `${(index % 9) * 75}ms`,
								"--confetti-color":
									confettiColors[index % confettiColors.length],
							} as CSSProperties
						}
					/>
				))}
			</div>
			<div className="spinning-wheel-result-content">
				<span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
					<PartyPopper size={31} strokeWidth={1.6} aria-hidden="true" />
				</span>
				<h2
					id="spinning-wheel-winner-title"
					className="mt-5 font-display text-2xl font-semibold"
				>
					{title}
				</h2>
				<p
					className="mt-3 break-words px-4 py-3 text-3xl font-bold tracking-tight sm:text-4xl"
					style={{
						backgroundColor: winner.color,
						color: wheelTextColor(winner.color),
					}}
				>
					{winner.label}
				</p>
				<p
					id="spinning-wheel-winner-description"
					className="mt-4 text-sm leading-relaxed text-muted"
				>
					{description}
				</p>
				<button
					ref={confirmButtonRef}
					type="button"
					className="tool-button tool-button-primary mt-7 w-full"
					onClick={() => {
						dialogRef.current?.close();
						onConfirm();
					}}
				>
					{confirmLabel}
				</button>
			</div>
		</dialog>
	);
}

function pointOnWheel(angle: number, radius: number) {
	const radians = ((angle - 90) * Math.PI) / 180;
	return {
		x: 50 + Math.cos(radians) * radius,
		y: 50 + Math.sin(radians) * radius,
	};
}

function slicePath(index: number, count: number) {
	const step = 360 / count;
	const start = pointOnWheel(index * step - step / 2, 48);
	const end = pointOnWheel(index * step + step / 2, 48);
	return `M 50 50 L ${start.x} ${start.y} A 48 48 0 ${step > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`;
}

function WheelGraphic({
	items,
	rotation,
	spinning,
	onSpinEnd,
	label,
}: {
	items: WheelItem[];
	rotation: number;
	spinning: boolean;
	onSpinEnd: () => void;
	label: string;
}) {
	return (
		<div className="spinning-wheel-stage">
			<div className="spinning-wheel-pointer" aria-hidden="true" />
			<svg
				viewBox="0 0 100 100"
				role="img"
				aria-label={label}
				className="spinning-wheel-rotor"
				style={{
					transform: `rotate(${rotation}deg)`,
					transition: spinning
						? `transform ${spinDuration}ms cubic-bezier(0.13, 0.75, 0.18, 1)`
						: "none",
				}}
				onTransitionEnd={(event) => {
					if (
						event.target === event.currentTarget &&
						event.propertyName === "transform"
					)
						onSpinEnd();
				}}
			>
				<circle
					cx="50"
					cy="50"
					r="49"
					fill="#f4f0e8"
					stroke="#111111"
					strokeWidth="0.8"
				/>
				{items.map((item, index) => {
					const center = pointOnWheel((index * 360) / items.length, 29);
					const labelLength =
						items.length <= 6 ? 14 : items.length <= 12 ? 8 : 0;
					return (
						<g key={item.id}>
							{items.length === 1 ? (
								<circle cx="50" cy="50" r="48" fill={item.color} />
							) : (
								<path
									d={slicePath(index, items.length)}
									fill={item.color}
									stroke="#fff"
									strokeWidth="0.35"
								/>
							)}
							{labelLength > 0 && (
								<text
									x={center.x}
									y={center.y}
									textAnchor="middle"
									dominantBaseline="middle"
									fill={wheelTextColor(item.color)}
									fontSize={items.length <= 4 ? "4" : "2.8"}
									fontWeight="700"
								>
									{item.label.length > labelLength
										? `${item.label.slice(0, labelLength - 1)}…`
										: item.label}
								</text>
							)}
						</g>
					);
				})}
				<circle
					cx="50"
					cy="50"
					r="4"
					fill="#fff"
					stroke="#111"
					strokeWidth="0.7"
				/>
			</svg>
		</div>
	);
}

function loadWheelItems() {
	try {
		return {
			items: parseStoredWheelItems(
				window.localStorage.getItem(wheelStorageKey),
			),
			storageFailed: false,
		};
	} catch {
		return { items: [] as WheelItem[], storageFailed: true };
	}
}

export function SpinningWheelPage() {
	const { t: common } = useToolsLocale();
	const t = useSpinningWheelTranslations();
	const [initial] = useState(loadWheelItems);
	const [items, setItems] = useState<WheelItem[]>(initial.items);
	const [storageFailed, setStorageFailed] = useState(initial.storageFailed);
	const [newName, setNewName] = useState("");
	const [bulkText, setBulkText] = useState("");
	const [inputError, setInputError] = useState<"required" | "duplicate" | null>(
		null,
	);
	const [bulkResult, setBulkResult] = useState<{
		added: number;
		duplicates: string[];
	} | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [winner, setWinner] = useState<WheelItem | null>(null);
	const [spinFailed, setSpinFailed] = useState(false);
	const [spinning, setSpinning] = useState(false);
	const [rotation, setRotation] = useState(0);
	const pendingWinner = useRef<WheelItem | null>(null);
	const spinTimer = useRef<number | null>(null);
	const spinFrame = useRef<number | null>(null);
	const bulkDetailsRef = useRef<HTMLDetailsElement>(null);
	const spinButtonRef = useRef<HTMLButtonElement>(null);
	const newItemInputRef = useRef<HTMLInputElement>(null);
	const restoreFocus = useRef(false);

	useEffect(() => {
		try {
			window.localStorage.setItem(wheelStorageKey, JSON.stringify(items));
		} catch {
			setStorageFailed(true);
		}
	}, [items]);

	useEffect(
		() => () => {
			if (spinTimer.current !== null) window.clearTimeout(spinTimer.current);
			if (spinFrame.current !== null)
				window.cancelAnimationFrame(spinFrame.current);
		},
		[],
	);

	useEffect(() => {
		if (winner || !restoreFocus.current) return;
		restoreFocus.current = false;
		if (items.length > 0) spinButtonRef.current?.focus();
		else newItemInputRef.current?.focus();
	}, [winner, items.length]);

	function clearResult() {
		setWinner(null);
		setSpinFailed(false);
	}

	function addOne(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!newName.trim()) {
			setInputError("required");
			return;
		}
		const result = addWheelItems(items, [newName]);
		if (!result.added) {
			setInputError("duplicate");
			return;
		}
		setItems(result.items);
		setNewName("");
		setInputError(null);
		setBulkResult(null);
		clearResult();
	}

	function addMany(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!bulkText.trim()) {
			setBulkResult(null);
			setInputError("required");
			return;
		}
		const result = addWheelItems(items, bulkText.split(/\r?\n/));
		if (result.added) {
			setItems(result.items);
			setBulkText("");
			if (bulkDetailsRef.current) {
				bulkDetailsRef.current.open = false;
				bulkDetailsRef.current.querySelector("summary")?.focus();
			}
			clearResult();
		}
		setBulkResult({ added: result.added, duplicates: result.duplicates });
		setInputError(null);
	}

	function saveEdit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!editingId) return;
		const label = editName.trim();
		if (!label) {
			setInputError("required");
			return;
		}
		if (
			items.some(
				(item) =>
					item.id !== editingId &&
					normalizedLabel(item.label) === normalizedLabel(label),
			)
		) {
			setInputError("duplicate");
			return;
		}
		setItems(
			items.map((item) => (item.id === editingId ? { ...item, label } : item)),
		);
		setEditingId(null);
		setInputError(null);
		clearResult();
	}

	function finishSpin() {
		const selected = pendingWinner.current;
		if (!selected) return;
		pendingWinner.current = null;
		if (spinTimer.current !== null) window.clearTimeout(spinTimer.current);
		spinTimer.current = null;
		setWinner(selected);
		setSpinning(false);
	}

	function confirmWinner() {
		if (!winner) return;
		setItems((current) => current.filter((item) => item.id !== winner.id));
		setWinner(null);
		setRotation(0);
		restoreFocus.current = true;
	}

	function spin() {
		if (spinning || winner || editingId || items.length === 0) return;
		setSpinFailed(false);
		setWinner(null);
		setBulkResult(null);
		try {
			const index = randomWheelIndex(items.length);
			pendingWinner.current = items[index];
			const target = targetWheelRotation(rotation, index, items.length);
			const reducedMotion =
				window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
				false;
			if (reducedMotion) {
				setRotation(target);
				finishSpin();
				return;
			}
			setSpinning(true);
			spinFrame.current = window.requestAnimationFrame(() => {
				spinFrame.current = null;
				setRotation(target);
				spinTimer.current = window.setTimeout(finishSpin, spinDuration + 150);
			});
		} catch {
			pendingWinner.current = null;
			setSpinning(false);
			setSpinFailed(true);
		}
	}

	return (
		<main className="mx-auto max-w-7xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
			<Link
				to="/"
				className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
			>
				<ArrowLeft size={16} aria-hidden="true" /> {common.backToTools}
			</Link>
			<div className="mt-10">
				<h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl">
					{t.title}
				</h1>
				<p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
					{t.intro}
				</p>
			</div>
			{storageFailed && (
				<p
					role="status"
					className="mt-6 border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900"
				>
					{t.storageError}
				</p>
			)}
			<div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
				<section className="border border-ink/20 bg-white p-5 md:p-7">
					<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">
						{t.wheel}
					</h2>
					{items.length ? (
						<WheelGraphic
							items={items}
							rotation={rotation}
							spinning={spinning}
							onSpinEnd={finishSpin}
							label={t.wheelPreview}
						/>
					) : (
						<div className="spinning-wheel-empty">{t.emptyWheel}</div>
					)}
					{items.length > 12 && (
						<p className="mt-3 text-center text-sm text-muted">
							{t.labelsInList}
						</p>
					)}
					<button
						ref={spinButtonRef}
						type="button"
						className="tool-button tool-button-primary mx-auto mt-6 flex min-w-48"
						disabled={
							!items.length || spinning || winner !== null || editingId !== null
						}
						onClick={spin}
					>
						<RotateCw size={18} aria-hidden="true" />{" "}
						{spinning ? t.spinning : t.spin}
					</button>
					{spinFailed && (
						<p role="alert" className="mt-4 text-center text-sm text-red-700">
							{t.spinError}
						</p>
					)}
				</section>
				<section className="border border-ink/20 bg-white p-5 md:p-7">
					<div className="flex items-center justify-between gap-4 border-b border-ink/15 pb-4">
						<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">
							{t.items}
						</h2>
						<span className="font-mono text-xs text-muted">
							{t.itemCount.replace("{count}", String(items.length))}
						</span>
					</div>
					<fieldset disabled={spinning || winner !== null} className="min-w-0">
						<form onSubmit={addOne} className="mt-6">
							<label htmlFor="wheel-new-name" className="tool-label">
								{t.addItem}
							</label>
							<div className="mt-2 flex gap-2">
								<input
									ref={newItemInputRef}
									id="wheel-new-name"
									className="tool-input min-w-0"
									value={newName}
									onChange={(event) => {
										setNewName(event.target.value);
										setInputError(null);
									}}
									placeholder={t.itemPlaceholder}
									aria-label={t.itemName}
								/>
								<button type="submit" className="tool-button shrink-0">
									<Plus size={16} aria-hidden="true" />
									{t.add}
								</button>
							</div>
						</form>
						<details
							ref={bulkDetailsRef}
							className="spinning-wheel-bulk mt-7 border-t border-ink/10 pt-6"
						>
							<summary className="flex cursor-pointer items-center justify-between gap-3 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
								<span className="flex items-center gap-2">
									<Plus size={16} aria-hidden="true" />

									{t.bulkTitle}
								</span>
								<ChevronDown
									className="spinning-wheel-bulk-chevron"
									size={18}
									aria-hidden="true"
								/>
							</summary>
							<form onSubmit={addMany} className="mt-4">
								<label htmlFor="wheel-bulk" className="tool-label">
									{t.bulkHint}
								</label>
								<textarea
									id="wheel-bulk"
									className="tool-input mt-2 min-h-24 resize-y"
									value={bulkText}
									onChange={(event) => {
										setBulkText(event.target.value);
										setInputError(null);
									}}
									placeholder={t.bulkPlaceholder}
									aria-label={t.bulkTitle}
								/>
								<button type="submit" className="tool-button mt-2">
									{t.addMany}
								</button>
							</form>
						</details>
						{inputError && (
							<p role="alert" className="mt-3 text-sm text-red-700">
								{t[inputError]}
							</p>
						)}
						{bulkResult && (
							<p role="status" className="mt-3 text-sm text-muted">
								{bulkResult.added > 0 &&
									t.addedCount.replace("{count}", String(bulkResult.added))}
								{bulkResult.duplicates.length > 0 &&
									` ${t.duplicatesSkipped.replace("{names}", bulkResult.duplicates.join(", "))}`}
							</p>
						)}
						<ul className="mt-7 space-y-2 border-t border-ink/10 pt-6">
							{items.map((item) => (
								<li
									key={item.id}
									className="flex min-w-0 items-center gap-2 border border-ink/15 p-2"
								>
									<input
										type="color"
										className="size-10 rounded-full shrink-0 cursor-pointer bg-white p-0.5"
										value={item.color}
										aria-label={t.color.replace("{name}", item.label)}
										onChange={(event) => {
											setItems(
												items.map((candidate) =>
													candidate.id === item.id
														? { ...candidate, color: event.target.value }
														: candidate,
												),
											);
											clearResult();
										}}
									/>
									{editingId === item.id ? (
										<form
											onSubmit={saveEdit}
											className="flex min-w-0 flex-1 flex-wrap gap-2"
										>
											<input
												className="tool-input min-w-28 flex-1"
												value={editName}
												aria-label={t.itemName}
												onChange={(event) => {
													setEditName(event.target.value);
													setInputError(null);
												}}
											/>
											<button type="submit" className="tool-button">
												{t.save}
											</button>
											<button
												type="button"
												className="tool-button"
												onClick={() => {
													setEditingId(null);
													setInputError(null);
												}}
											>
												{t.cancel}
											</button>
										</form>
									) : (
										<>
											<span className="min-w-0 flex-1 break-words text-sm font-semibold">
												{item.label}
											</span>
											<button
												type="button"
												className="icon-button shrink-0"
												aria-label={t.edit.replace("{name}", item.label)}
												onClick={() => {
													setEditingId(item.id);
													setEditName(item.label);
													setInputError(null);
												}}
											>
												<Pencil size={16} aria-hidden="true" />
											</button>
											<button
												type="button"
												className="icon-button shrink-0"
												aria-label={t.remove.replace("{name}", item.label)}
												onClick={() => {
													setItems(
														items.filter(
															(candidate) => candidate.id !== item.id,
														),
													);
													clearResult();
												}}
											>
												<Trash2 size={16} aria-hidden="true" />
											</button>
										</>
									)}
								</li>
							))}
						</ul>
					</fieldset>
				</section>
			</div>
			{winner && (
				<WinnerDialog
					winner={winner}
					title={t.winner}
					description={t.winnerPending.replace("{name}", winner.label)}
					confirmLabel={t.confirmWinner}
					onConfirm={confirmWinner}
				/>
			)}
		</main>
	);
}
