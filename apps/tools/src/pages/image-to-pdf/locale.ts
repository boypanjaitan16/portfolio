import type { ToolSeoCopy } from "../../toolSeo";
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

export const imageToPdfSeo = {
	en: {
		metaTitle: "Images to PDF – Convert JPG, PNG & WebP to PDF Free",
		metaDescription:
			"Combine up to 30 JPG, PNG, or WebP images into one PDF, one image per page. Choose A4, Letter, or image-sized pages. Free and processed in your browser.",
		about: [
			"Images to PDF turns photos, scans, and screenshots into a single PDF with one image per page. Add images by picking or dropping them, preview them, change their order, and remove any you do not need.",
			"Pages can be A4 or Letter, following each image's portrait or landscape orientation with a 10 mm white margin, or match each image's aspect ratio. Images are drawn from their pixels, so camera metadata such as location is not copied into the PDF.",
		],
		features: [
			"Convert up to 30 PNG, JPEG, or WebP images at once",
			"Drag and drop, preview, reorder, and remove images",
			"A4, Letter, or match-image-ratio page sizes",
			"Automatic portrait or landscape pages",
			"EXIF orientation applied and metadata removed",
			"Runs entirely in your browser",
		],
		steps: [
			"Add or drop your images.",
			"Put them in order and choose a page size.",
			"Download the combined PDF.",
		],
		faq: [
			{
				question: "Which image formats are supported?",
				answer:
					"PNG, JPEG, and WebP. Each image can be up to 50 MB, 50 megapixels, and 16,384 pixels on either side.",
			},
			{
				question: "Are my images uploaded?",
				answer:
					"No. Images are decoded and the PDF is created in your browser.",
			},
			{
				question: "Will the images be cropped?",
				answer:
					"No. Each image fits inside the page margin without cropping, and the embedded resolution is capped at 300 DPI.",
			},
		],
	},
	id: {
		metaTitle: "Gambar ke PDF – Ubah JPG, PNG & WebP ke PDF Gratis",
		metaDescription:
			"Gabungkan hingga 30 gambar JPG, PNG, atau WebP menjadi satu PDF, satu gambar per halaman. Pilih A4, Letter, atau ukuran gambar. Gratis dan diproses di browser.",
		about: [
			"Gambar ke PDF mengubah foto, hasil pindai, dan tangkapan layar menjadi satu PDF dengan satu gambar per halaman. Tambahkan gambar dengan memilih atau menyeretnya, lihat pratinjau, ubah urutan, dan hapus yang tidak diperlukan.",
			"Halaman dapat berukuran A4 atau Letter dengan orientasi mengikuti setiap gambar dan margin putih 10 mm, atau mengikuti rasio gambar. Gambar digambar ulang dari pikselnya, sehingga metadata kamera seperti lokasi tidak ikut ke PDF.",
		],
		features: [
			"Ubah hingga 30 gambar PNG, JPEG, atau WebP sekaligus",
			"Seret dan lepas, pratinjau, urutkan, dan hapus gambar",
			"Ukuran halaman A4, Letter, atau mengikuti rasio gambar",
			"Halaman potret atau lanskap otomatis",
			"Orientasi EXIF diterapkan dan metadata dihapus",
			"Berjalan sepenuhnya di browser Anda",
		],
		steps: [
			"Tambahkan atau seret gambar Anda.",
			"Atur urutannya dan pilih ukuran halaman.",
			"Unduh PDF gabungan.",
		],
		faq: [
			{
				question: "Format gambar apa yang didukung?",
				answer:
					"PNG, JPEG, dan WebP. Setiap gambar maksimal 50 MB, 50 megapiksel, dan 16.384 piksel di setiap sisi.",
			},
			{
				question: "Apakah gambar saya diunggah?",
				answer: "Tidak. Gambar dibaca dan PDF dibuat di browser Anda.",
			},
			{
				question: "Apakah gambar akan terpotong?",
				answer:
					"Tidak. Setiap gambar dimuat di dalam margin halaman tanpa dipotong, dan resolusinya dibatasi 300 DPI.",
			},
		],
	},
} satisfies ToolSeoCopy;
