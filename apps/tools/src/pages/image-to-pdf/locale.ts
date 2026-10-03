import { type Locale, useToolsLocale } from "../../toolsLocale";

const en = {
	title: "Images to PDF",
	cardDescription:
		"Combine multiple images into one PDF with one image per page.",
	intro:
		"Add images, arrange their pages, and download one PDF. Your images stay in this browser.",
	chooseImages: "Choose images",
	addImages: "Add images",
	adding: "Adding images…",
	dropHint: "or drag and drop images here",
	formats: "PNG, JPEG, or WebP · up to 30 images, 50 MB each",
	emptyTitle: "Add images to create a PDF.",
	emptyDescription: "Each image becomes one page.",
	images: "Images",
	imageCount: "{count} of {max}",
	imageDimensions: "{width} × {height} px",
	moveUp: "Move up",
	moveDown: "Move down",
	remove: "Remove",
	clearAll: "Clear all",
	settings: "PDF settings",
	pageSize: "Page size",
	sizeA4: "A4",
	sizeLetter: "Letter",
	sizeImage: "Match image ratio",
	layoutHint:
		"A4 and Letter pages use the image's orientation and a 10 mm white margin. Match image ratio uses a page up to A4's long side.",
	create: "Create PDF",
	creating: "Creating PDF…",
	outputHint: "One image per page, in the order shown. Images are not cropped.",
	tooMany: "Only 30 images can be added. Extra files were skipped.",
	unsupported: "{name}: use a PNG, JPEG, or WebP image.",
	fileTooLarge: "{name}: file is larger than 50 MB.",
	imageTooLarge:
		"{name}: image exceeds 50 megapixels or 16,384 pixels on one side.",
	invalidImage: "{name}: image could not be opened.",
	createFailed: "The PDF could not be created. Try fewer or smaller images.",
	fileFailed: "{name}: the PDF could not be created from this image.",
};

const id = {
	title: "Gambar ke PDF",
	cardDescription:
		"Gabungkan beberapa gambar menjadi satu PDF dengan satu gambar per halaman.",
	intro:
		"Tambahkan gambar, atur urutan halamannya, lalu unduh satu PDF. Gambar tetap di browser ini.",
	chooseImages: "Pilih gambar",
	addImages: "Tambah gambar",
	adding: "Menambahkan gambar…",
	dropHint: "atau tarik gambar ke sini",
	formats: "PNG, JPEG, atau WebP · maks. 30 gambar, masing-masing 50 MB",
	emptyTitle: "Tambahkan gambar untuk membuat PDF.",
	emptyDescription: "Setiap gambar menjadi satu halaman.",
	images: "Gambar",
	imageCount: "{count} dari {max}",
	imageDimensions: "{width} × {height} px",
	moveUp: "Pindah ke atas",
	moveDown: "Pindah ke bawah",
	remove: "Hapus",
	clearAll: "Hapus semua",
	settings: "Pengaturan PDF",
	pageSize: "Ukuran halaman",
	sizeA4: "A4",
	sizeLetter: "Letter",
	sizeImage: "Ikuti rasio gambar",
	layoutHint:
		"Halaman A4 dan Letter mengikuti orientasi gambar dengan margin putih 10 mm. Ikuti rasio gambar menggunakan halaman dengan sisi terpanjang setara A4.",
	create: "Buat PDF",
	creating: "Membuat PDF…",
	outputHint:
		"Satu gambar per halaman, sesuai urutan yang ditampilkan. Gambar tidak dipotong.",
	tooMany: "Hanya 30 gambar yang dapat ditambahkan. File lainnya dilewati.",
	unsupported: "{name}: gunakan gambar PNG, JPEG, atau WebP.",
	fileTooLarge: "{name}: file lebih besar dari 50 MB.",
	imageTooLarge:
		"{name}: gambar melebihi 50 megapiksel atau 16.384 piksel pada satu sisi.",
	invalidImage: "{name}: gambar tidak dapat dibuka.",
	createFailed:
		"PDF tidak dapat dibuat. Coba gunakan lebih sedikit gambar atau gambar yang lebih kecil.",
	fileFailed: "{name}: PDF tidak dapat dibuat dari gambar ini.",
} satisfies Record<keyof typeof en, string>;

const translations = { en, id } satisfies Record<
	Locale,
	Record<keyof typeof en, string>
>;

export const imageToPdfCard = {
	en: { name: en.title, description: en.cardDescription },
	id: { name: id.title, description: id.cardDescription },
} satisfies Record<Locale, { name: string; description: string }>;

export function useImageToPdfTranslations() {
	return translations[useToolsLocale().locale];
}
