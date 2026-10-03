import type { QrLogo } from "./qrCodeModel";

const maxLogoBytes = 10 * 1024 * 1024;
const maxLogoDimension = 1024;
const supportedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export type LogoErrorCode = "unsupported" | "tooLarge" | "decode";

export class LogoError extends Error {
	readonly code: LogoErrorCode;

	constructor(code: LogoErrorCode) {
		super(code);
		this.code = code;
	}
}

function readFile(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () =>
			typeof reader.result === "string"
				? resolve(reader.result)
				: reject(new LogoError("decode"));
		reader.onerror = () => reject(new LogoError("decode"));
		reader.readAsDataURL(file);
	});
}

function decodeImage(source: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () =>
			image.naturalWidth > 0 && image.naturalHeight > 0
				? resolve(image)
				: reject(new LogoError("decode"));
		image.onerror = () => reject(new LogoError("decode"));
		image.src = source;
	});
}

export async function loadQrLogo(file: File): Promise<QrLogo> {
	if (!supportedTypes.has(file.type)) throw new LogoError("unsupported");
	if (file.size > maxLogoBytes) throw new LogoError("tooLarge");
	try {
		const image = await decodeImage(await readFile(file));
		const scale = Math.min(
			1,
			maxLogoDimension / Math.max(image.naturalWidth, image.naturalHeight),
		);
		const canvas = document.createElement("canvas");
		canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
		canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
		const context = canvas.getContext("2d");
		if (!context) throw new LogoError("decode");
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
		return {
			dataUrl: canvas.toDataURL("image/png"),
			name: file.name,
			width: canvas.width,
			height: canvas.height,
			canvas,
		};
	} catch {
		throw new LogoError("decode");
	}
}
