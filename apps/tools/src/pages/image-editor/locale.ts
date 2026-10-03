import type { ToolSeoCopy } from "../../toolSeo";
import { type Locale, useToolsLocale } from "../../toolsLocale";

const en = {
	title: "Image Editor & EXIF Remover",
	cardDescription:
		"Crop, rotate, and straighten an image, then download it without EXIF or GPS metadata.",
	intro:
		"Crop, rotate, or straighten an image and download a clean copy without camera, location, or other metadata.",
	chooseImage: "Choose image",
	replaceImage: "Replace image",
	dropHint: "or drag and drop an image here",
	formats: "PNG, JPEG, or WebP · up to 50 MB",
	emptyTitle: "Add an image to start editing.",
	emptyDescription: "Your image stays in this browser.",
	loading: "Opening image…",
	preview: "Preview",
	imageDetails: "{name} · {width} × {height} px",
	cropArea: "Crop area",
	instructions:
		"Drag the crop area to move it or drag its handles to resize. When the crop area is focused, use the arrow keys to move it by 1 px, or 10 px with Shift.",
	rotateTitle: "Rotate & flip",
	rotateLeft: "Rotate left",
	rotateRight: "Rotate right",
	flipHorizontal: "Flip horizontal",
	flipVertical: "Flip vertical",
	straighten: "Straighten",
	angle: "Angle (degrees)",
	resetRotation: "Reset rotation",
	cropTitle: "Crop",
	aspectRatio: "Aspect ratio",
	aspect_free: "Free",
	aspect_original: "Original",
	cropX: "X",
	cropY: "Y",
	cropWidth: "Width",
	cropHeight: "Height",
	resetCrop: "Reset crop",
	outputSize: "Output: {width} × {height} px",
	metadataTitle: "Metadata",
	readingMetadata: "Reading metadata…",
	noMetadata: "No metadata detected in this file.",
	metadataFound: "This file contains metadata:",
	gpsWarning: "This image contains the location where it was taken.",
	field_make: "Camera make",
	field_model: "Camera model",
	field_lens: "Lens",
	field_software: "Software",
	field_dateTaken: "Date taken",
	field_dateModified: "Date modified",
	field_artist: "Artist",
	field_copyright: "Copyright",
	field_gps: "GPS location",
	blocksFound: "Metadata blocks",
	block_exif: "EXIF",
	block_gps: "GPS",
	block_xmp: "XMP",
	block_iptc: "IPTC",
	block_icc: "ICC color profile",
	block_text: "Text comments",
	removalNote:
		"Downloading creates a new image from the pixels only. All metadata above is left out.",
	downloadTitle: "Download",
	format: "Format",
	quality: "Quality",
	jpegNote:
		"JPEG has no transparency, so empty or transparent areas become white.",
	download: "Download image",
	downloading: "Preparing download…",
	downloadClean: "Downloaded {name}. No metadata was found in the new file.",
	downloadWarning:
		"Downloaded {name}, but this browser added metadata to it: {blocks}.",
	invalidFile: "Choose a PNG, JPEG, or WebP image.",
	invalidImage: "This image could not be opened. Try another file.",
	tooLarge:
		"This image is too large. Use a file up to 50 MB and 50 megapixels.",
	formatUnsupported:
		"This browser cannot create that format. Choose another format.",
	exportFailed: "The image could not be created. Try a smaller crop.",
};

const id = {
	title: "Editor Gambar & Penghapus EXIF",
	cardDescription:
		"Potong, putar, dan luruskan gambar, lalu unduh tanpa metadata EXIF atau GPS.",
	intro:
		"Potong, putar, atau luruskan gambar dan unduh salinan bersih tanpa metadata kamera, lokasi, atau lainnya.",
	chooseImage: "Pilih gambar",
	replaceImage: "Ganti gambar",
	dropHint: "atau tarik gambar ke sini",
	formats: "PNG, JPEG, atau WebP · maks. 50 MB",
	emptyTitle: "Tambahkan gambar untuk mulai mengedit.",
	emptyDescription: "Gambar Anda tetap di browser ini.",
	loading: "Membuka gambar…",
	preview: "Pratinjau",
	imageDetails: "{name} · {width} × {height} px",
	cropArea: "Area potong",
	instructions:
		"Geser area potong untuk memindahkannya atau geser pegangannya untuk mengubah ukuran. Saat area potong difokuskan, gunakan tombol panah untuk memindahkannya 1 px, atau 10 px dengan Shift.",
	rotateTitle: "Putar & balik",
	rotateLeft: "Putar ke kiri",
	rotateRight: "Putar ke kanan",
	flipHorizontal: "Balik horizontal",
	flipVertical: "Balik vertikal",
	straighten: "Luruskan",
	angle: "Sudut (derajat)",
	resetRotation: "Atur ulang putaran",
	cropTitle: "Potong",
	aspectRatio: "Rasio aspek",
	aspect_free: "Bebas",
	aspect_original: "Asli",
	cropX: "X",
	cropY: "Y",
	cropWidth: "Lebar",
	cropHeight: "Tinggi",
	resetCrop: "Atur ulang potongan",
	outputSize: "Hasil: {width} × {height} px",
	metadataTitle: "Metadata",
	readingMetadata: "Membaca metadata…",
	noMetadata: "Tidak ada metadata yang terdeteksi di file ini.",
	metadataFound: "File ini berisi metadata:",
	gpsWarning: "Gambar ini berisi lokasi tempat gambar diambil.",
	field_make: "Merek kamera",
	field_model: "Model kamera",
	field_lens: "Lensa",
	field_software: "Perangkat lunak",
	field_dateTaken: "Tanggal diambil",
	field_dateModified: "Tanggal diubah",
	field_artist: "Pembuat",
	field_copyright: "Hak cipta",
	field_gps: "Lokasi GPS",
	blocksFound: "Blok metadata",
	block_exif: "EXIF",
	block_gps: "GPS",
	block_xmp: "XMP",
	block_iptc: "IPTC",
	block_icc: "Profil warna ICC",
	block_text: "Komentar teks",
	removalNote:
		"Mengunduh membuat gambar baru hanya dari pikselnya. Semua metadata di atas tidak disertakan.",
	downloadTitle: "Unduh",
	format: "Format",
	quality: "Kualitas",
	jpegNote:
		"JPEG tidak mendukung transparansi, jadi area kosong atau transparan menjadi putih.",
	download: "Unduh gambar",
	downloading: "Menyiapkan unduhan…",
	downloadClean:
		"{name} telah diunduh. Tidak ada metadata yang ditemukan di file baru.",
	downloadWarning:
		"{name} telah diunduh, tetapi browser ini menambahkan metadata: {blocks}.",
	invalidFile: "Pilih gambar PNG, JPEG, atau WebP.",
	invalidImage: "Gambar ini tidak dapat dibuka. Coba file lain.",
	tooLarge:
		"Gambar ini terlalu besar. Gunakan file maksimal 50 MB dan 50 megapiksel.",
	formatUnsupported:
		"Browser ini tidak dapat membuat format tersebut. Pilih format lain.",
	exportFailed: "Gambar tidak dapat dibuat. Coba potongan yang lebih kecil.",
} satisfies Record<keyof typeof en, string>;

export const imageEditorTranslations = { en, id } satisfies Record<
	Locale,
	Record<keyof typeof en, string>
>;

export const imageEditorCard = {
	en: { name: en.title, description: en.cardDescription },
	id: { name: id.title, description: id.cardDescription },
} satisfies Record<Locale, { name: string; description: string }>;

export function useImageEditorTranslations() {
	return imageEditorTranslations[useToolsLocale().locale];
}

export const imageEditorSeo = {
	en: {
		metaTitle: "Online Image Editor – Crop, Rotate, Flip & Remove Metadata",
		metaDescription:
			"Crop, rotate, flip, and straighten PNG, JPEG, or WebP images, view EXIF and GPS metadata, and download a clean copy. Free and private in your browser.",
		about: [
			"The Image Editor crops, rotates, flips, and straightens a PNG, JPEG, or WebP image. Drag or resize the crop, set it in pixels, or lock it to Free, Original, 1:1, 4:3, 3:2, or 16:9.",
			"It also shows the metadata hidden in your image, such as camera, date, and GPS location. Downloads are redrawn from pixels, so they contain no identifying metadata, and the tool confirms this after export.",
		],
		features: [
			"Rotate in 90° steps and straighten from -45° to 45°",
			"Flip horizontally or vertically",
			"Crop with handles, arrow keys, pixels, or fixed ratios",
			"Inspect EXIF, GPS, XMP, IPTC, and ICC metadata",
			"Export PNG, JPEG, or WebP with adjustable quality",
			"Downloads are stripped of identifying metadata",
		],
		steps: [
			"Open a PNG, JPEG, or WebP image.",
			"Rotate, flip, straighten, and crop it.",
			"Choose a format and quality, then download.",
		],
		faq: [
			{
				question: "Does the editor remove location data?",
				answer:
					"Yes. Exported images are redrawn from pixels, so EXIF data, including GPS location, is not copied, and the page checks the downloaded file.",
			},
			{
				question: "Which files can I open?",
				answer:
					"PNG, JPEG, and WebP images up to 50 MB and 50 megapixels. HEIC and other formats are not supported.",
			},
			{
				question: "Can it resize or apply filters?",
				answer:
					"No. Use the Image Compressor & Converter to resize. The editor focuses on cropping, rotation, and metadata.",
			},
		],
	},
	id: {
		metaTitle: "Editor Gambar Online – Potong, Putar, Balik & Hapus Metadata",
		metaDescription:
			"Potong, putar, balik, dan luruskan gambar PNG, JPEG, atau WebP, lihat metadata EXIF dan GPS, lalu unduh salinan bersih. Gratis dan privat di browser.",
		about: [
			"Editor Gambar memotong, memutar, membalik, dan meluruskan gambar PNG, JPEG, atau WebP. Seret atau ubah ukuran area potong, atur dalam piksel, atau kunci ke rasio Bebas, Asli, 1:1, 4:3, 3:2, atau 16:9.",
			"Tool ini juga menampilkan metadata tersembunyi di gambar, seperti kamera, tanggal, dan lokasi GPS. Unduhan digambar ulang dari piksel sehingga tidak berisi metadata identitas, dan tool memastikannya setelah ekspor.",
		],
		features: [
			"Putar per 90° dan luruskan dari -45° hingga 45°",
			"Balik secara horizontal atau vertikal",
			"Potong dengan pegangan, tombol panah, piksel, atau rasio tetap",
			"Periksa metadata EXIF, GPS, XMP, IPTC, dan ICC",
			"Ekspor PNG, JPEG, atau WebP dengan kualitas yang dapat diatur",
			"Unduhan bebas dari metadata identitas",
		],
		steps: [
			"Buka gambar PNG, JPEG, atau WebP.",
			"Putar, balik, luruskan, dan potong gambar.",
			"Pilih format dan kualitas, lalu unduh.",
		],
		faq: [
			{
				question: "Apakah editor ini menghapus data lokasi?",
				answer:
					"Ya. Gambar hasil ekspor digambar ulang dari piksel, sehingga data EXIF termasuk lokasi GPS tidak ikut, dan halaman memeriksa file yang diunduh.",
			},
			{
				question: "File apa saja yang bisa dibuka?",
				answer:
					"Gambar PNG, JPEG, dan WebP hingga 50 MB dan 50 megapiksel. HEIC dan format lain tidak didukung.",
			},
			{
				question: "Bisakah mengubah ukuran atau menambahkan filter?",
				answer:
					"Tidak. Gunakan Kompres & Konversi Gambar untuk mengubah ukuran. Editor ini berfokus pada pemotongan, rotasi, dan metadata.",
			},
		],
	},
} satisfies ToolSeoCopy;
