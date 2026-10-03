import type { ToolSeoCopy } from "../../toolSeo";
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

export const qrCodeSeo = {
	en: {
		metaTitle: "Free QR Code Generator with Logo – PNG & SVG Download",
		metaDescription:
			"Create a QR code from text or a URL, choose colors and dot styles, add a center logo, and download PNG or SVG. Free, no sign-up, made in your browser.",
		about: [
			"The QR Code Generator turns any text or URL into a QR code that updates as you type. Choose the foreground and background colors, pick square, rounded, or dot modules, and download a PNG from 256 to 2048 px or a scalable SVG.",
			"You can add a PNG, JPEG, or WebP logo to the center. The tool raises error correction when a logo is added, warns about low-contrast colors, and blocks downloads when the content no longer fits.",
		],
		features: [
			"Text or URL encoded exactly as typed",
			"Custom colors and square, rounded, or dot styles",
			"Optional center logo sized from 10% to 25%",
			"PNG (256–2048 px) and self-contained SVG downloads",
			"Contrast warning for hard-to-scan colors",
			"Generated locally with no upload",
		],
		steps: [
			"Enter text or paste a URL.",
			"Choose colors, a style, and an optional logo.",
			"Download the QR code as PNG or SVG and test it before sharing.",
		],
		faq: [
			{
				question: "Do the QR codes expire?",
				answer:
					"No. The QR code contains your content directly, with no redirect service, so it works as long as the content is valid.",
			},
			{
				question: "Will a logo affect scanning?",
				answer:
					"It can. The tool uses high error correction with a logo and keeps the functional patterns square, but test decorative codes before sharing them.",
			},
			{
				question: "Is my content sent to a server?",
				answer:
					"No. The QR code and its downloads are created in your browser.",
			},
		],
	},
	id: {
		metaTitle: "Pembuat Kode QR Gratis dengan Logo – Unduh PNG & SVG",
		metaDescription:
			"Buat kode QR dari teks atau URL, pilih warna dan gaya titik, tambahkan logo di tengah, lalu unduh PNG atau SVG. Gratis, tanpa daftar, dibuat di browser.",
		about: [
			"Pembuat Kode QR mengubah teks atau URL apa pun menjadi kode QR yang langsung diperbarui saat Anda mengetik. Pilih warna depan dan latar, gaya modul kotak, membulat, atau titik, lalu unduh PNG 256 hingga 2048 px atau SVG.",
			"Anda dapat menambahkan logo PNG, JPEG, atau WebP di tengah. Tool ini menaikkan koreksi kesalahan saat logo ditambahkan, memperingatkan warna dengan kontras rendah, dan menolak unduhan jika konten tidak lagi muat.",
		],
		features: [
			"Teks atau URL disimpan persis seperti yang diketik",
			"Warna khusus serta gaya kotak, membulat, atau titik",
			"Logo tengah opsional berukuran 10% hingga 25%",
			"Unduh PNG (256–2048 px) dan SVG mandiri",
			"Peringatan kontras untuk warna yang sulit dipindai",
			"Dibuat secara lokal tanpa unggah",
		],
		steps: [
			"Masukkan teks atau tempel URL.",
			"Pilih warna, gaya, dan logo opsional.",
			"Unduh kode QR sebagai PNG atau SVG dan uji sebelum dibagikan.",
		],
		faq: [
			{
				question: "Apakah kode QR bisa kedaluwarsa?",
				answer:
					"Tidak. Kode QR berisi konten Anda secara langsung tanpa layanan pengalihan, sehingga tetap berfungsi selama kontennya valid.",
			},
			{
				question: "Apakah logo memengaruhi pemindaian?",
				answer:
					"Bisa. Tool ini memakai koreksi kesalahan tinggi saat ada logo dan menjaga pola fungsional tetap kotak, tetapi uji kode QR dekoratif sebelum dibagikan.",
			},
			{
				question: "Apakah konten saya dikirim ke server?",
				answer: "Tidak. Kode QR dan unduhannya dibuat di browser Anda.",
			},
		],
	},
} satisfies ToolSeoCopy;
