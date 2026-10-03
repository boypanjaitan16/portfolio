import { type Locale, useToolsLocale } from "../../toolsLocale";

const en = {
	title: "QR Code Generator",
	cardDescription: "Turn text or a URL into a downloadable QR code.",
	intro:
		"Create a QR code from text or a URL, customize its colors and style, and download it as PNG or SVG.",
	privacy: "Created locally · No upload",
	content: "Text or URL",
	contentPlaceholder: "Enter text or paste a URL",
	contentHint: "The QR code contains exactly what you type.",
	appearance: "Appearance",
	moduleStyle: "Block style",
	styleSquare: "Square",
	styleRounded: "Rounded",
	styleDots: "Dots",
	foreground: "Foreground color",
	background: "Background color",
	size: "Download size",
	logoTitle: "Center logo",
	logoHint:
		"Add one PNG, JPEG, or WebP image (up to 10 MB). The image stays in your browser.",
	addLogo: "Add logo",
	replaceLogo: "Replace logo",
	removeLogo: "Remove logo",
	loadingLogo: "Opening logo…",
	logoSize: "Logo area",
	scanHint:
		"Decorative blocks and logos may affect scanning. Test the downloaded QR code before sharing it.",
	unsupported: "Choose a PNG, JPEG, or WebP image.",
	tooLarge: "The logo must be 10 MB or smaller.",
	decode: "This image could not be opened. Choose another logo.",
	preview: "QR code preview",
	emptyTitle: "Enter text or a URL to create a QR code.",
	emptyDescription: "Your content stays in this browser.",
	creating: "Creating QR code…",
	contrastWarning:
		"These colors may be difficult for QR scanners to read. Try a darker foreground and a lighter background.",
	tooLong: "This content is too long for a QR code. Shorten it and try again.",
	createError: "The QR code could not be created. Please try again.",
	downloadError: "The QR code could not be downloaded. Please try again.",
	downloadPng: "Download PNG",
	downloadSvg: "Download SVG",
};

const id = {
	title: "Pembuat Kode QR",
	cardDescription: "Ubah teks atau URL menjadi kode QR yang dapat diunduh.",
	intro:
		"Buat kode QR dari teks atau URL, atur warna dan gayanya, lalu unduh sebagai PNG atau SVG.",
	privacy: "Dibuat lokal · Tanpa unggah",
	content: "Teks atau URL",
	contentPlaceholder: "Masukkan teks atau tempel URL",
	contentHint: "Kode QR berisi persis teks yang Anda masukkan.",
	appearance: "Tampilan",
	moduleStyle: "Gaya blok",
	styleSquare: "Kotak",
	styleRounded: "Membulat",
	styleDots: "Titik",
	foreground: "Warna depan",
	background: "Warna latar",
	size: "Ukuran unduhan",
	logoTitle: "Logo tengah",
	logoHint:
		"Tambahkan satu gambar PNG, JPEG, atau WebP (maksimal 10 MB). Gambar tetap di browser Anda.",
	addLogo: "Tambah logo",
	replaceLogo: "Ganti logo",
	removeLogo: "Hapus logo",
	loadingLogo: "Membuka logo…",
	logoSize: "Bidang logo",
	scanHint:
		"Blok dekoratif dan logo dapat memengaruhi pemindaian. Uji kode QR yang diunduh sebelum dibagikan.",
	unsupported: "Pilih gambar PNG, JPEG, atau WebP.",
	tooLarge: "Ukuran logo harus 10 MB atau kurang.",
	decode: "Gambar ini tidak dapat dibuka. Pilih logo lain.",
	preview: "Pratinjau kode QR",
	emptyTitle: "Masukkan teks atau URL untuk membuat kode QR.",
	emptyDescription: "Konten Anda tetap di browser ini.",
	creating: "Membuat kode QR…",
	contrastWarning:
		"Warna ini mungkin sulit dibaca pemindai QR. Coba warna depan yang lebih gelap dan latar yang lebih terang.",
	tooLong:
		"Konten ini terlalu panjang untuk kode QR. Pendekkan lalu coba lagi.",
	createError: "Kode QR tidak dapat dibuat. Silakan coba lagi.",
	downloadError: "Kode QR tidak dapat diunduh. Silakan coba lagi.",
	downloadPng: "Unduh PNG",
	downloadSvg: "Unduh SVG",
} satisfies Record<keyof typeof en, string>;

export const qrCodeTranslations = { en, id } satisfies Record<
	Locale,
	Record<keyof typeof en, string>
>;

export const qrCodeCard = {
	en: { name: en.title, description: en.cardDescription },
	id: { name: id.title, description: id.cardDescription },
} satisfies Record<Locale, { name: string; description: string }>;

export function useQrCodeTranslations() {
	return qrCodeTranslations[useToolsLocale().locale];
}
