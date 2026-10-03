import jsQR from "jsqr";
import * as QRCode from "qrcode";
import {
	createQrDesign,
	hasLowQrContrast,
	logoSizeMax,
	logoSizeMin,
	type QrDesign,
	type QrLogo,
	qrStyles,
} from "./qrCodeModel";
import {
	qrLogoGeometry,
	qrShapes,
	renderQrCanvas,
	renderQrSvg,
} from "./qrCodeRender";

function sampleLogo(): QrLogo {
	return {
		dataUrl: "data:image/png;base64,cG5n",
		name: "logo.png",
		width: 200,
		height: 100,
		canvas: document.createElement("canvas"),
	};
}

function scanGeometry(design: QrDesign): string | undefined {
	const pixelsPerModule = 12;
	const width = (design.modules.size + 8) * pixelsPerModule;
	const data = new Uint8ClampedArray(width * width * 4);
	for (let index = 0; index < data.length; index += 4) {
		data[index] = 255;
		data[index + 1] = 255;
		data[index + 2] = 255;
		data[index + 3] = 255;
	}
	for (const shape of qrShapes(design)) {
		const x0 = shape.kind === "rect" ? shape.x : shape.x - shape.radius;
		const y0 = shape.kind === "rect" ? shape.y : shape.y - shape.radius;
		const x1 = shape.kind === "rect" ? shape.x + 1 : shape.x + shape.radius;
		const y1 = shape.kind === "rect" ? shape.y + 1 : shape.y + shape.radius;
		for (
			let py = Math.floor(y0 * pixelsPerModule);
			py < Math.ceil(y1 * pixelsPerModule);
			py += 1
		) {
			for (
				let px = Math.floor(x0 * pixelsPerModule);
				px < Math.ceil(x1 * pixelsPerModule);
				px += 1
			) {
				const x = (px + 0.5) / pixelsPerModule;
				const y = (py + 0.5) / pixelsPerModule;
				const inside =
					shape.kind === "circle"
						? (x - shape.x) ** 2 + (y - shape.y) ** 2 <= shape.radius ** 2
						: Math.max(Math.abs(x - shape.x - 0.5) - 0.5 + shape.radius, 0) **
								2 +
								Math.max(Math.abs(y - shape.y - 0.5) - 0.5 + shape.radius, 0) **
									2 <=
							shape.radius ** 2;
				if (inside) {
					const index = (py * width + px) * 4;
					data[index] = 0;
					data[index + 1] = 0;
					data[index + 2] = 0;
				}
			}
		}
	}
	const badge = qrLogoGeometry(design);
	if (badge) {
		for (
			let py = Math.floor(badge.y * pixelsPerModule);
			py < Math.ceil((badge.y + badge.size) * pixelsPerModule);
			py += 1
		) {
			for (
				let px = Math.floor(badge.x * pixelsPerModule);
				px < Math.ceil((badge.x + badge.size) * pixelsPerModule);
				px += 1
			) {
				const index = (py * width + px) * 4;
				data[index] = 255;
				data[index + 1] = 255;
				data[index + 2] = 255;
			}
		}
	}
	return jsQR(data, width, width, { inversionAttempts: "dontInvert" })?.data;
}

it("keeps functional modules square and uses the same geometry in SVG", () => {
	for (const style of qrStyles) {
		const design = createQrDesign(
			"https://example.com/test",
			style,
			"#123456",
			"#ffffff",
			null,
			20,
		);
		const shapes = qrShapes(design);
		const svg = renderQrSvg(design, 1024);
		const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
		const total = design.modules.size + 8;
		expect(parsed.querySelector("parsererror")).toBeNull();
		expect(parsed.documentElement.getAttribute("width")).toBe("1024");
		expect(parsed.documentElement.getAttribute("height")).toBe("1024");
		expect(parsed.documentElement.getAttribute("viewBox")).toBe(
			`0 0 ${total} ${total}`,
		);
		expect(parsed.querySelectorAll("g > rect, g > circle").length).toBe(
			shapes.length,
		);
		for (const shape of shapes) {
			const row = Math.floor(
				(shape.kind === "circle" ? shape.y - 0.5 : shape.y) - 4,
			);
			const col = Math.floor(
				(shape.kind === "circle" ? shape.x - 0.5 : shape.x) - 4,
			);
			if (design.modules.isReserved(row, col)) {
				expect(shape).toMatchObject({ kind: "rect", radius: 0 });
			}
		}
		expect(shapes.every((shape) => shape.x >= 4 && shape.y >= 4)).toBe(true);
		if (style === "dots")
			expect(parsed.querySelector("g > circle")).not.toBeNull();
		if (style === "rounded")
			expect(parsed.querySelector("g > rect[rx]")).not.toBeNull();
	}
});

it("snaps square canvas modules to pixel edges to avoid scanning seams", () => {
	const design = createQrDesign(
		"https://example.com/qr",
		"square",
		"#000000",
		"#ffffff",
		null,
		20,
	);
	const fillRect = vi.fn();
	const canvas = document.createElement("canvas");
	vi.spyOn(canvas, "getContext").mockReturnValue({
		fillRect,
	} as unknown as CanvasRenderingContext2D);
	renderQrCanvas(canvas, design, 512);
	expect([canvas.width, canvas.height]).toEqual([512, 512]);
	for (const [x, y, width, height] of fillRect.mock.calls.slice(1)) {
		expect([x, y, width, height].every(Number.isInteger)).toBe(true);
	}
	expect(renderQrSvg(design, 512)).toContain('shape-rendering="crispEdges"');
});

it("uses H with a logo, keeps its aspect ratio, and clamps the badge size", () => {
	const logo = sampleLogo();
	const design = createQrDesign(
		"hello",
		"dots",
		"#000000",
		"#ffffff",
		logo,
		20,
	);
	const badge = qrLogoGeometry(design);
	const svg = renderQrSvg(design, 256);
	expect(
		QRCode.create("hello", { errorCorrectionLevel: "H" }).modules.data,
	).toEqual(design.modules.data);
	expect(badge?.size).toBeCloseTo(design.modules.size * 0.2);
	expect((badge?.imageWidth ?? 0) / (badge?.imageHeight ?? 1)).toBeCloseTo(2);
	expect(svg).toContain(`href="${logo.dataUrl}"`);
	expect(svg).toContain('preserveAspectRatio="xMidYMid meet"');
	expect(
		createQrDesign("hello", "square", "#000000", "#ffffff", logo, 0).logoSize,
	).toBe(logoSizeMin);
	expect(
		createQrDesign("hello", "square", "#000000", "#ffffff", logo, 100).logoSize,
	).toBe(logoSizeMax);
	expect(
		createQrDesign("hello", "square", "#000000", "#ffffff", null, 20).modules
			.data,
	).toEqual(QRCode.create("hello", { errorCorrectionLevel: "M" }).modules.data);
});

it("produces independently decodable geometry with each style and a center badge", () => {
	for (const style of qrStyles) {
		for (const logo of [null, sampleLogo()]) {
			const text = "https://example.com/qr";
			const design = createQrDesign(
				text,
				style,
				"#000000",
				"#ffffff",
				logo,
				20,
			);
			expect(scanGeometry(design)).toBe(text);
		}
	}
});

it("warns about inverted or low-contrast colors", () => {
	expect(hasLowQrContrast("#000000", "#ffffff")).toBe(false);
	expect(hasLowQrContrast("#ffffff", "#000000")).toBe(true);
	expect(hasLowQrContrast("#777777", "#888888")).toBe(true);
	expect(hasLowQrContrast("#222222", "#eeeeee")).toBe(false);
});
