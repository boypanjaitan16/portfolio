import {
	Braces,
	CircleDashed,
	Crop,
	FilePenLine,
	Images,
	type LucideIcon,
	Minimize2,
	Pipette,
	QrCode,
} from "lucide-react";
import { type LazyPage, lazyPage } from "./lazyPage";
import { colorPickerCard, colorPickerSeo } from "./pages/color-picker/locale";
import {
	dataFormatterCard,
	dataFormatterSeo,
} from "./pages/data-formatter/locale";
import {
	imageCompressorCard,
	imageCompressorSeo,
} from "./pages/image-compressor/locale";
import { imageEditorCard, imageEditorSeo } from "./pages/image-editor/locale";
import { imageToPdfCard, imageToPdfSeo } from "./pages/image-to-pdf/locale";
import { pdfToolCard, pdfToolSeo } from "./pages/pdf-editor/locale";
import { qrCodeCard, qrCodeSeo } from "./pages/qr-code-generator/locale";
import {
	spinningWheelCard,
	spinningWheelSeo,
} from "./pages/spinning-wheel/locale";
import type { ToolSeoCopy } from "./toolSeo";
import type { Locale } from "./toolsLocale";

export type Tool = {
	/** Route segment under `/tools/`; also names the prerendered HTML and OG image. */
	slug: string;
	icon: LucideIcon;
	card: Record<Locale, { name: string; description: string }>;
	seo: ToolSeoCopy;
	page: LazyPage;
};

/**
 * Every public tool, in landing-page order. Routes, landing cards, About
 * sections, meta tags, prerendered HTML, OG images, and the tools sitemap are
 * all generated from this list.
 */
export const tools: Tool[] = [
	{
		slug: "pdf-editor",
		icon: FilePenLine,
		card: pdfToolCard,
		seo: pdfToolSeo,
		page: lazyPage(
			() => import("./pages/pdf-editor/PdfEditorPage"),
			"PdfEditorPage",
		),
	},
	{
		slug: "image-to-pdf",
		icon: Images,
		card: imageToPdfCard,
		seo: imageToPdfSeo,
		page: lazyPage(
			() => import("./pages/image-to-pdf/ImageToPdfPage"),
			"ImageToPdfPage",
		),
	},
	{
		slug: "color-picker",
		icon: Pipette,
		card: colorPickerCard,
		seo: colorPickerSeo,
		page: lazyPage(
			() => import("./pages/color-picker/ColorPickerPage"),
			"ColorPickerPage",
		),
	},
	{
		slug: "qr-code-generator",
		icon: QrCode,
		card: qrCodeCard,
		seo: qrCodeSeo,
		page: lazyPage(
			() => import("./pages/qr-code-generator/QrCodeGeneratorPage"),
			"QrCodeGeneratorPage",
		),
	},
	{
		slug: "spinning-wheel",
		icon: CircleDashed,
		card: spinningWheelCard,
		seo: spinningWheelSeo,
		page: lazyPage(
			() => import("./pages/spinning-wheel/SpinningWheelPage"),
			"SpinningWheelPage",
		),
	},
	{
		slug: "image-editor",
		icon: Crop,
		card: imageEditorCard,
		seo: imageEditorSeo,
		page: lazyPage(
			() => import("./pages/image-editor/ImageEditorPage"),
			"ImageEditorPage",
		),
	},
	{
		slug: "image-compressor",
		icon: Minimize2,
		card: imageCompressorCard,
		seo: imageCompressorSeo,
		page: lazyPage(
			() => import("./pages/image-compressor/ImageCompressorPage"),
			"ImageCompressorPage",
		),
	},
	{
		slug: "data-formatter",
		icon: Braces,
		card: dataFormatterCard,
		seo: dataFormatterSeo,
		page: lazyPage(
			() => import("./pages/data-formatter/DataFormatterPage"),
			"DataFormatterPage",
		),
	},
];

/** Finds the tool for a router path such as `/pdf-editor` or `/pdf-editor/`. */
export function findToolByPath(pathname: string) {
	const slug = pathname.replace(/^\/+|\/+$/g, "");
	return tools.find((tool) => tool.slug === slug);
}
