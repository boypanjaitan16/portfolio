import type { QrDesign } from "./qrCodeModel";

const margin = 4;

type Shape =
	| { kind: "rect"; x: number; y: number; radius: number }
	| { kind: "circle"; x: number; y: number; radius: number };

export interface LogoGeometry {
	x: number;
	y: number;
	size: number;
	imageX: number;
	imageY: number;
	imageWidth: number;
	imageHeight: number;
}

export function qrShapes(design: QrDesign): Shape[] {
	const shapes: Shape[] = [];
	const { modules, style } = design;
	for (let row = 0; row < modules.size; row += 1) {
		for (let col = 0; col < modules.size; col += 1) {
			if (!modules.get(row, col)) continue;
			const x = margin + col;
			const y = margin + row;
			if (modules.isReserved(row, col) || style === "square") {
				shapes.push({ kind: "rect", x, y, radius: 0 });
			} else if (style === "rounded") {
				shapes.push({ kind: "rect", x, y, radius: 0.3 });
			} else {
				shapes.push({ kind: "circle", x: x + 0.5, y: y + 0.5, radius: 0.42 });
			}
		}
	}
	return shapes;
}

export function qrLogoGeometry(design: QrDesign): LogoGeometry | null {
	if (!design.logo) return null;
	const symbolSize = design.modules.size;
	const size = (symbolSize * design.logoSize) / 100;
	const x = margin + (symbolSize - size) / 2;
	const y = x;
	const inset = size * 0.08;
	const innerSize = size - inset * 2;
	const scale = Math.min(
		innerSize / design.logo.width,
		innerSize / design.logo.height,
	);
	const imageWidth = design.logo.width * scale;
	const imageHeight = design.logo.height * scale;
	return {
		x,
		y,
		size,
		imageX: x + (size - imageWidth) / 2,
		imageY: y + (size - imageHeight) / 2,
		imageWidth,
		imageHeight,
	};
}

export function renderQrCanvas(
	canvas: HTMLCanvasElement,
	design: QrDesign,
	width: number,
): void {
	canvas.width = width;
	canvas.height = width;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Canvas 2D context unavailable");
	const unit = width / (design.modules.size + margin * 2);
	context.fillStyle = design.background;
	context.fillRect(0, 0, width, width);
	context.fillStyle = design.foreground;
	for (const shape of qrShapes(design)) {
		if (shape.kind === "circle") {
			context.beginPath();
			context.arc(
				shape.x * unit,
				shape.y * unit,
				shape.radius * unit,
				0,
				Math.PI * 2,
			);
			context.fill();
		} else if (shape.radius) {
			context.beginPath();
			context.roundRect(
				shape.x * unit,
				shape.y * unit,
				unit,
				unit,
				shape.radius * unit,
			);
			context.fill();
		} else {
			const left = Math.round(shape.x * unit);
			const top = Math.round(shape.y * unit);
			const right = Math.round((shape.x + 1) * unit);
			const bottom = Math.round((shape.y + 1) * unit);
			context.fillRect(left, top, right - left, bottom - top);
		}
	}
	const badge = qrLogoGeometry(design);
	if (badge && design.logo) {
		context.fillStyle = design.background;
		context.fillRect(
			badge.x * unit,
			badge.y * unit,
			badge.size * unit,
			badge.size * unit,
		);
		context.drawImage(
			design.logo.canvas,
			badge.imageX * unit,
			badge.imageY * unit,
			badge.imageWidth * unit,
			badge.imageHeight * unit,
		);
	}
}

export function renderQrSvg(design: QrDesign, width: number): string {
	const total = design.modules.size + margin * 2;
	const shapes = qrShapes(design)
		.map((shape) => {
			if (shape.kind === "circle") {
				return `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.radius}"/>`;
			}
			return `<rect x="${shape.x}" y="${shape.y}" width="1" height="1"${shape.radius ? ` rx="${shape.radius}"` : ' shape-rendering="crispEdges"'}/>`;
		})
		.join("");
	const badge = qrLogoGeometry(design);
	const logo =
		badge && design.logo
			? `<rect x="${badge.x}" y="${badge.y}" width="${badge.size}" height="${badge.size}" fill="${design.background}"/><image x="${badge.imageX}" y="${badge.imageY}" width="${badge.imageWidth}" height="${badge.imageHeight}" href="${design.logo.dataUrl}" preserveAspectRatio="xMidYMid meet"/>`
			: "";
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${total} ${total}"><rect width="${total}" height="${total}" fill="${design.background}"/><g fill="${design.foreground}">${shapes}</g>${logo}</svg>`;
}
