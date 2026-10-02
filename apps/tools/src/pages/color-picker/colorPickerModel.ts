export type Pixel = {
	x: number;
	y: number;
	r: number;
	g: number;
	b: number;
	a: number;
};

export type ImagePoint = Pick<Pixel, "x" | "y">;

export function imagePointFromClient(
	clientX: number,
	clientY: number,
	rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
	imageWidth: number,
	imageHeight: number,
): ImagePoint | null {
	if (
		rect.width <= 0 ||
		rect.height <= 0 ||
		imageWidth <= 0 ||
		imageHeight <= 0
	)
		return null;
	return {
		x: Math.max(
			0,
			Math.min(
				imageWidth - 1,
				Math.floor(((clientX - rect.left) / rect.width) * imageWidth),
			),
		),
		y: Math.max(
			0,
			Math.min(
				imageHeight - 1,
				Math.floor(((clientY - rect.top) / rect.height) * imageHeight),
			),
		),
	};
}

export function colorHex({ r, g, b }: Pixel): string {
	return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function colorRgb({ r, g, b }: Pixel): string {
	return `rgb(${r}, ${g}, ${b})`;
}

export function opacityPercent({ a }: Pixel): string {
	return `${Math.round((a / 255) * 1000) / 10}%`;
}
