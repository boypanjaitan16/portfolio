import { useEffect, useRef, useState } from "react";
import type { SourceDocument } from "./pdfModel";

export function PdfCanvas({
	source,
	pageIndex,
	width,
	height,
}: {
	source: SourceDocument;
	pageIndex: number;
	width: number;
	height: number;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		if (!("IntersectionObserver" in window)) {
			setVisible(true);
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting) {
				setVisible(true);
				observer.disconnect();
			}
		});
		observer.observe(canvas);
		return () => observer.disconnect();
	}, []);
	useEffect(() => {
		if (!visible) return;
		let cancelled = false;
		let renderTask:
			| ReturnType<Awaited<ReturnType<typeof source.preview.getPage>>["render"]>
			| undefined;
		async function render() {
			try {
				const page = await source.preview.getPage(pageIndex + 1);
				if (cancelled) return;
				const canvas = canvasRef.current;
				const context = canvas?.getContext("2d");
				if (!canvas || !context) return;
				const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
				const viewport = page.getViewport({
					scale:
						(width / page.getViewport({ scale: 1, rotation: 0 }).width) *
						pixelRatio,
					rotation: 0,
				});
				canvas.width = Math.ceil(viewport.width);
				canvas.height = Math.ceil(viewport.height);
				renderTask = page.render({ canvas, canvasContext: context, viewport });
				await renderTask.promise;
			} catch {
				/* A removed page or cancelled render no longer needs a preview. */
			}
		}
		void render();
		return () => {
			cancelled = true;
			renderTask?.cancel();
		};
	}, [source, pageIndex, width, visible]);
	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{ width, height }}
			className="block bg-white"
		/>
	);
}
