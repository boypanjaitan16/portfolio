import * as QRCode from "qrcode";

export const downloadSizes = [256, 512, 1024, 2048] as const;
export type DownloadSize = (typeof downloadSizes)[number];
export const qrStyles = ["square", "rounded", "dots"] as const;
export type QrStyle = (typeof qrStyles)[number];
export const logoSizeMin = 10;
export const logoSizeMax = 25;
export const defaultLogoSize = 20;

export interface QrLogo {
	dataUrl: string;
	name: string;
	width: number;
	height: number;
	canvas: HTMLCanvasElement;
}

export interface QrDesign {
	modules: QRCode.QRCode["modules"];
	style: QrStyle;
	foreground: string;
	background: string;
	logo: QrLogo | null;
	logoSize: number;
}

export function createQrDesign(
	content: string,
	style: QrStyle,
	foreground: string,
	background: string,
	logo: QrLogo | null,
	logoSize: number,
): QrDesign {
	return {
		modules: QRCode.create(content, {
			errorCorrectionLevel: logo ? "H" : "M",
		}).modules,
		style,
		foreground,
		background,
		logo,
		logoSize: Math.min(logoSizeMax, Math.max(logoSizeMin, logoSize)),
	};
}

function luminance(hex: string): number {
	const channels = [1, 3, 5].map((start) => {
		const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
		return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	});
	return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function hasLowQrContrast(
	foreground: string,
	background: string,
): boolean {
	const dark = luminance(foreground);
	const light = luminance(background);
	return dark >= light || (light + 0.05) / (dark + 0.05) < 4.5;
}
