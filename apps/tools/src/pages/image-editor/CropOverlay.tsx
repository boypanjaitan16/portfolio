import { type KeyboardEvent, type PointerEvent, useRef } from "react";
import {
	type CropHandle,
	type CropRect,
	moveCrop,
	resizeCrop,
	type Size,
} from "./imageTransformModel";

const handles: readonly CropHandle[] = [
	"nw",
	"n",
	"ne",
	"e",
	"se",
	"s",
	"sw",
	"w",
];

type Drag = {
	pointerId: number;
	handle: CropHandle | null;
	clientX: number;
	clientY: number;
	start: CropRect;
};

export function CropOverlay({
	crop,
	bounds,
	scale,
	ratio,
	label,
	describedBy,
	onChange,
}: {
	crop: CropRect;
	bounds: Size;
	/** Display pixels per image pixel. */
	scale: number;
	ratio: number | null;
	label: string;
	describedBy: string;
	onChange: (crop: CropRect) => void;
}) {
	const dragRef = useRef<Drag | null>(null);

	function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
		if (event.pointerType === "mouse" && event.button !== 0) return;
		const target = event.target as HTMLElement;
		dragRef.current = {
			pointerId: event.pointerId,
			handle: (target.dataset.handle as CropHandle | undefined) ?? null,
			clientX: event.clientX,
			clientY: event.clientY,
			start: crop,
		};
		event.currentTarget.setPointerCapture?.(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		const dx = (event.clientX - drag.clientX) / scale;
		const dy = (event.clientY - drag.clientY) / scale;
		onChange(
			drag.handle
				? resizeCrop(drag.start, drag.handle, dx, dy, bounds, ratio)
				: moveCrop(drag.start, dx, dy, bounds),
		);
	}

	function endDrag(event: PointerEvent<HTMLButtonElement>) {
		if (dragRef.current?.pointerId !== event.pointerId) return;
		dragRef.current = null;
		if (event.currentTarget.hasPointerCapture?.(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
		const step = event.shiftKey ? 10 : 1;
		const changes: Record<string, [number, number]> = {
			ArrowLeft: [-step, 0],
			ArrowRight: [step, 0],
			ArrowUp: [0, -step],
			ArrowDown: [0, step],
		};
		const change = changes[event.key];
		if (!change) return;
		event.preventDefault();
		onChange(moveCrop(crop, change[0], change[1], bounds));
	}

	return (
		<button
			type="button"
			aria-label={label}
			aria-describedby={describedBy}
			className="image-editor-crop absolute touch-none cursor-move p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			style={{
				left: crop.x * scale,
				top: crop.y * scale,
				width: crop.width * scale,
				height: crop.height * scale,
			}}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={endDrag}
			onPointerCancel={endDrag}
			onKeyDown={handleKeyDown}
		>
			<span aria-hidden="true" className="image-editor-thirds" />
			{handles.map((handle) => (
				<span
					key={handle}
					aria-hidden="true"
					data-handle={handle}
					className={`image-editor-handle image-editor-handle-${handle}`}
				/>
			))}
		</button>
	);
}
