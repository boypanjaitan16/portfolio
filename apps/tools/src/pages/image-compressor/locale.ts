import { type Locale, useToolsLocale } from "../../toolsLocale";

const en = {
	title: "Image Compressor & Converter",
	cardDescription:
		"Compress and resize images, or convert between JPG, PNG, and WebP.",
	intro:
		"Add one or more images, choose a format, quality, and size, then download each result or all of them as a ZIP.",
	chooseImages: "Choose images",
	addImages: "Add images",
	dropHint: "or drag and drop images here",
	formats: "PNG, JPEG, or WebP · up to 30 images, 50 MB each",
	emptyTitle: "Add images to start compressing.",
	emptyDescription: "Your images stay in this browser.",
	filesTitle: "Images",
	fileCount: "{count} of {max}",
	settingsTitle: "Settings",
	format: "Output format",
	format_original: "Keep original format",
	quality: "Quality",
	qualityHint: "Lower quality makes JPEG and WebP files smaller.",
	pngNote:
		"PNG is lossless, so quality and target size do not apply. Resize to make PNG files smaller.",
	jpegNote: "JPEG has no transparency, so transparent areas become white.",
	targetEnabled: "Limit file size",
	targetKb: "Maximum size (KB)",
	targetHint:
		"Lowers quality first, then dimensions, until each file fits. Applies to JPEG and WebP.",
	resizeTitle: "Resize",
	resize_none: "Keep size",
	resize_percent: "Percentage",
	resize_dimensions: "Width and height",
	resize_longestSide: "Longest side",
	percent: "Scale (%)",
	width: "Width (px)",
	height: "Height (px)",
	keepRatio: "Keep aspect ratio",
	dimensionsHint:
		"Leave one side blank to calculate it from the other. With the ratio kept, images fit inside both sides.",
	longestSide: "Longest side (px)",
	allowUpscale: "Allow enlarging smaller images",
	compress: "Compress {count} images",
	compressOne: "Compress 1 image",
	compressing: "Compressing {done} of {total}…",
	outdated: "Settings changed. Compress again to apply them.",
	metadataNote:
		"Output files are drawn from pixels only, so EXIF, GPS, and other metadata are not included.",
	status_waiting: "Ready",
	status_processing: "Compressing…",
	original: "Original",
	result: "Result",
	dimensions: "{width} × {height} px",
	saved: "{percent}% smaller",
	grew: "{percent}% larger than the original",
	targetMissed: "Could not reach {target}; this is the smallest result found.",
	download: "Download",
	downloadNamed: "Download {name}",
	remove: "Remove",
	removeNamed: "Remove {name}",
	downloadAll: "Download all (ZIP)",
	preparingZip: "Preparing ZIP…",
	clearAll: "Clear all",
	totals: "{before} → {after} ({percent})",
	skipped: "Skipped {names}. Use PNG, JPEG, or WebP files up to 50 MB.",
	tooMany: "Only 30 images can be added at once. Extra files were skipped.",
	invalidImage: "This image could not be opened.",
	tooLarge: "This image is larger than 50 megapixels.",
	formatUnsupported: "This browser cannot create this format.",
	exportFailed: "The image could not be created. Try a smaller size.",
	zipFailed:
		"The ZIP file could not be created. Try downloading images one by one.",
};

const id = {
	title: "Kompres & Konversi Gambar",
	cardDescription:
		"Kompres dan ubah ukuran gambar, atau konversi antara JPG, PNG, dan WebP.",
	intro:
		"Tambahkan satu atau beberapa gambar, pilih format, kualitas, dan ukuran, lalu unduh tiap hasil atau semuanya sebagai ZIP.",
	chooseImages: "Pilih gambar",
	addImages: "Tambah gambar",
	dropHint: "atau tarik gambar ke sini",
	formats: "PNG, JPEG, atau WebP · maks. 30 gambar, masing-masing 50 MB",
	emptyTitle: "Tambahkan gambar untuk mulai mengompres.",
	emptyDescription: "Gambar Anda tetap di browser ini.",
	filesTitle: "Gambar",
	fileCount: "{count} dari {max}",
	settingsTitle: "Pengaturan",
	format: "Format hasil",
	format_original: "Pertahankan format asli",
	quality: "Kualitas",
	qualityHint: "Kualitas lebih rendah membuat file JPEG dan WebP lebih kecil.",
	pngNote:
		"PNG bersifat lossless, jadi kualitas dan batas ukuran tidak berlaku. Ubah ukuran untuk memperkecil file PNG.",
	jpegNote:
		"JPEG tidak mendukung transparansi, jadi area transparan menjadi putih.",
	targetEnabled: "Batasi ukuran file",
	targetKb: "Ukuran maksimal (KB)",
	targetHint:
		"Menurunkan kualitas terlebih dahulu, lalu dimensi, hingga tiap file muat. Berlaku untuk JPEG dan WebP.",
	resizeTitle: "Ubah ukuran",
	resize_none: "Pertahankan ukuran",
	resize_percent: "Persentase",
	resize_dimensions: "Lebar dan tinggi",
	resize_longestSide: "Sisi terpanjang",
	percent: "Skala (%)",
	width: "Lebar (px)",
	height: "Tinggi (px)",
	keepRatio: "Pertahankan rasio aspek",
	dimensionsHint:
		"Kosongkan salah satu sisi agar dihitung dari sisi lainnya. Jika rasio dipertahankan, gambar akan muat di dalam kedua sisi.",
	longestSide: "Sisi terpanjang (px)",
	allowUpscale: "Izinkan memperbesar gambar kecil",
	compress: "Kompres {count} gambar",
	compressOne: "Kompres 1 gambar",
	compressing: "Mengompres {done} dari {total}…",
	outdated: "Pengaturan berubah. Kompres lagi untuk menerapkannya.",
	metadataNote:
		"File hasil dibuat hanya dari piksel, jadi metadata EXIF, GPS, dan lainnya tidak disertakan.",
	status_waiting: "Siap",
	status_processing: "Mengompres…",
	original: "Asli",
	result: "Hasil",
	dimensions: "{width} × {height} px",
	saved: "{percent}% lebih kecil",
	grew: "{percent}% lebih besar dari aslinya",
	targetMissed:
		"Tidak dapat mencapai {target}; ini hasil terkecil yang ditemukan.",
	download: "Unduh",
	downloadNamed: "Unduh {name}",
	remove: "Hapus",
	removeNamed: "Hapus {name}",
	downloadAll: "Unduh semua (ZIP)",
	preparingZip: "Menyiapkan ZIP…",
	clearAll: "Hapus semua",
	totals: "{before} → {after} ({percent})",
	skipped:
		"{names} dilewati. Gunakan file PNG, JPEG, atau WebP maksimal 50 MB.",
	tooMany:
		"Hanya 30 gambar yang dapat ditambahkan sekaligus. File lainnya dilewati.",
	invalidImage: "Gambar ini tidak dapat dibuka.",
	tooLarge: "Gambar ini lebih besar dari 50 megapiksel.",
	formatUnsupported: "Browser ini tidak dapat membuat format ini.",
	exportFailed: "Gambar tidak dapat dibuat. Coba ukuran yang lebih kecil.",
	zipFailed: "File ZIP tidak dapat dibuat. Coba unduh gambar satu per satu.",
} satisfies Record<keyof typeof en, string>;

export const imageCompressorTranslations = { en, id } satisfies Record<
	Locale,
	Record<keyof typeof en, string>
>;

export const imageCompressorCard = {
	en: { name: en.title, description: en.cardDescription },
	id: { name: id.title, description: id.cardDescription },
} satisfies Record<Locale, { name: string; description: string }>;

export function useImageCompressorTranslations() {
	return imageCompressorTranslations[useToolsLocale().locale];
}
