import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

export type TextAnnotation = {
	id: string;
	type: "text";
	x: number;
	y: number;
	width: number;
	height: number;
	text: string;
	fontSize: number;
	color: string;
};

export type ImageAnnotation = {
	id: string;
	type: "image" | "signature";
	x: number;
	y: number;
	width: number;
	height: number;
	dataUrl: string;
};

export type Annotation = TextAnnotation | ImageAnnotation;

export type SourceDocument = {
	id: string;
	name: string;
	bytes: Uint8Array;
	preview: PDFDocumentProxy;
	loadingTask: PDFDocumentLoadingTask;
};

export type EditorPage = {
	id: string;
	sourceId: string;
	sourceIndex: number;
	width: number;
	height: number;
	originX: number;
	originTop: number;
	originalRotation: number;
	rotation: number;
	selected: boolean;
	annotations: Annotation[];
};

export function movePage(
	pages: EditorPage[],
	index: number,
	direction: -1 | 1,
): EditorPage[] {
	const target = index + direction;
	if (target < 0 || target >= pages.length) return pages;
	const updated = [...pages];
	[updated[index], updated[target]] = [updated[target], updated[index]];
	return updated;
}

export function displayRotation(page: EditorPage): number {
	return (((page.originalRotation + page.rotation) % 360) + 360) % 360;
}

export function clampAnnotation(
	annotation: Annotation,
	width: number,
	height: number,
): Annotation {
	const nextWidth = Math.max(20, Math.min(width, annotation.width));
	const nextHeight = Math.max(20, Math.min(height, annotation.height));
	return {
		...annotation,
		width: nextWidth,
		height: nextHeight,
		x: Math.max(0, Math.min(width - nextWidth, annotation.x)),
		y: Math.max(0, Math.min(height - nextHeight, annotation.y)),
	};
}
