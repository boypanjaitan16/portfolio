import { useEffect, useRef, useState } from "react";
import { usePdfTranslations } from "./locale";

export function SignaturePad({
	onSave,
	onClose,
}: {
	onSave: (dataUrl: string) => void;
	onClose: () => void;
}) {
	const t = usePdfTranslations();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const drawing = useRef(false);
	const [hasInk, setHasInk] = useState(false);
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext("2d");
		if (!context) return;
		context.lineWidth = 3;
		context.lineCap = "round";
		context.lineJoin = "round";
		context.strokeStyle = "#111111";
	}, []);
	const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		return {
			x:
				((event.clientX - bounds.left) * event.currentTarget.width) /
				bounds.width,
			y:
				((event.clientY - bounds.top) * event.currentTarget.height) /
				bounds.height,
		};
	};
	const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
		const context = event.currentTarget.getContext("2d");
		if (!context) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		const { x, y } = point(event);
		context.beginPath();
		context.moveTo(x, y);
		drawing.current = true;
	};
	const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (!drawing.current) return;
		const context = event.currentTarget.getContext("2d");
		if (!context) return;
		const { x, y } = point(event);
		context.lineTo(x, y);
		context.stroke();
		setHasInk(true);
	};
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
			role="presentation"
			onPointerDown={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-label={t.signatureTitle}
				className="w-full max-w-xl bg-paper p-5 shadow-soft sm:p-8"
			>
				<h2 className="text-2xl font-semibold">{t.signatureTitle}</h2>
				<p className="mt-2 text-sm text-muted">{t.signatureHelp}</p>
				<canvas
					ref={canvasRef}
					width={700}
					height={220}
					className="mt-5 w-full touch-none border border-ink/25 bg-white"
					onPointerDown={start}
					onPointerMove={move}
					onPointerUp={() => {
						drawing.current = false;
					}}
					onPointerCancel={() => {
						drawing.current = false;
					}}
					aria-label={t.signatureTitle}
				/>
				<div className="mt-5 flex flex-wrap justify-end gap-2">
					<button
						type="button"
						className="tool-button"
						onClick={() => {
							canvasRef.current?.getContext("2d")?.clearRect(0, 0, 700, 220);
							setHasInk(false);
						}}
					>
						{t.clearSignature}
					</button>
					<button type="button" className="tool-button" onClick={onClose}>
						{t.cancel}
					</button>
					<button
						type="button"
						className="tool-button tool-button-primary"
						disabled={!hasInk}
						onClick={() => {
							const canvas = canvasRef.current;
							if (canvas) onSave(canvas.toDataURL("image/png"));
						}}
					>
						{t.useSignature}
					</button>
				</div>
			</section>
		</div>
	);
}
