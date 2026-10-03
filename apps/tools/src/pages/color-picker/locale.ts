import type { ToolSeoCopy } from "../../toolSeo";
import { type Locale, useToolsLocale } from "../../toolsLocale";

const en = {
	title: "Color Picker",
	cardDescription: "Pick a color from an image and copy its HEX or RGB value.",
	intro: "Upload an image, hover over a pixel, and choose a color to copy.",
	privacy: "Processed locally · No upload",
	chooseImage: "Choose image",
	replaceImage: "Replace image",
	dropHint: "or drag and drop an image here",
	formats: "PNG, JPEG, or WebP",
	emptyTitle: "Add an image to start picking colors.",
	emptyDescription: "Your image stays in this browser.",
	preview: "Image preview",
	imageCanvas: "Sample colors from the uploaded image",
	instructions:
		"Hover to preview, click to select. On touch, drag and release. Use arrow keys to move one pixel and Enter or Space to select.",
	hoverColor: "Under cursor",
	selectedColor: "Selected color",
	hoverPlaceholder: "Move over the image to preview a color.",
	selectedPlaceholder: "Click or tap the image to select a color.",
	hex: "HEX",
	rgb: "RGB",
	opacity: "Opacity",
	transparent: "Fully transparent pixel",
	copyHex: "Copy HEX",
	copyRgb: "Copy RGB",
	copiedHex: "HEX copied.",
	copiedRgb: "RGB copied.",
	copyError: "Could not copy the color. Please try again.",
	invalidFile: "Choose a PNG, JPEG, or WebP image.",
	invalidImage: "This image could not be opened. Try another file.",
	readError: "The image pixels could not be read.",
	loading: "Opening image…",
	imageDetails: "{name} · {width} × {height} px",
	pixelPosition: "Pixel {x}, {y}",
};

const id = {
	title: "Pemilih Warna",
	cardDescription: "Pilih warna dari gambar dan salin nilai HEX atau RGB-nya.",
	intro:
		"Unggah gambar, arahkan kursor ke piksel, lalu pilih warna untuk disalin.",
	privacy: "Diproses lokal · Tanpa unggah",
	chooseImage: "Pilih gambar",
	replaceImage: "Ganti gambar",
	dropHint: "atau tarik gambar ke sini",
	formats: "PNG, JPEG, atau WebP",
	emptyTitle: "Tambahkan gambar untuk mulai memilih warna.",
	emptyDescription: "Gambar Anda tetap di browser ini.",
	preview: "Pratinjau gambar",
	imageCanvas: "Ambil warna dari gambar yang diunggah",
	instructions:
		"Arahkan kursor untuk melihat warna, klik untuk memilih. Pada layar sentuh, geser lalu lepas. Gunakan tombol panah untuk berpindah satu piksel dan Enter atau Spasi untuk memilih.",
	hoverColor: "Di bawah kursor",
	selectedColor: "Warna terpilih",
	hoverPlaceholder: "Arahkan kursor ke gambar untuk melihat warna.",
	selectedPlaceholder: "Klik atau ketuk gambar untuk memilih warna.",
	hex: "HEX",
	rgb: "RGB",
	opacity: "Opasitas",
	transparent: "Piksel sepenuhnya transparan",
	copyHex: "Salin HEX",
	copyRgb: "Salin RGB",
	copiedHex: "HEX disalin.",
	copiedRgb: "RGB disalin.",
	copyError: "Warna tidak dapat disalin. Coba lagi.",
	invalidFile: "Pilih gambar PNG, JPEG, atau WebP.",
	invalidImage: "Gambar ini tidak dapat dibuka. Coba file lain.",
	readError: "Piksel gambar tidak dapat dibaca.",
	loading: "Membuka gambar…",
	imageDetails: "{name} · {width} × {height} px",
	pixelPosition: "Piksel {x}, {y}",
} satisfies Record<keyof typeof en, string>;

export const colorPickerTranslations = { en, id } satisfies Record<
	Locale,
	Record<keyof typeof en, string>
>;

export const colorPickerCard = {
	en: { name: en.title, description: en.cardDescription },
	id: { name: id.title, description: id.cardDescription },
} satisfies Record<Locale, { name: string; description: string }>;

export function useColorPickerTranslations() {
	return colorPickerTranslations[useToolsLocale().locale];
}

export const colorPickerSeo = {
	en: {
		metaTitle: "Image Color Picker – Get HEX & RGB Colors from an Image",
		metaDescription:
			"Upload a PNG, JPEG, or WebP image and pick any pixel to get its HEX, RGB, and opacity values. Free, instant, and your image stays in your browser.",
		about: [
			"The Image Color Picker reads the exact color of any pixel in an image. Hover or move your finger over the image to preview a color, then click or release to select it and copy its HEX or RGB value.",
			"The image is opened locally in your browser and never uploaded. Fully transparent pixels show their opacity without a HEX or RGB value.",
		],
		features: [
			"Pick colors from PNG, JPEG, and WebP images",
			"Live preview while hovering or touching",
			"Copy HEX and RGB values in one click",
			"Shows pixel opacity for transparent images",
			"Works with mouse and touch",
			"No upload: the image stays on your device",
		],
		steps: [
			"Open an image.",
			"Hover over or touch the image to preview colors.",
			"Click to select a color and copy its HEX or RGB value.",
		],
		faq: [
			{
				question: "Can it pick colors from elsewhere on my screen?",
				answer: "No. It reads pixels only from the image you open in the tool.",
			},
			{
				question: "Does it extract a color palette?",
				answer: "No. It selects one pixel at a time.",
			},
			{
				question: "Is my image uploaded?",
				answer: "No. The image is read in your browser only.",
			},
		],
	},
	id: {
		metaTitle: "Pemilih Warna Gambar – Ambil Warna HEX & RGB dari Gambar",
		metaDescription:
			"Unggah gambar PNG, JPEG, atau WebP lalu pilih piksel mana pun untuk mendapatkan nilai HEX, RGB, dan opasitas. Gratis, instan, dan gambar tetap di browser.",
		about: [
			"Pemilih Warna Gambar membaca warna tepat dari piksel mana pun pada gambar. Arahkan kursor atau jari di atas gambar untuk melihat pratinjau warna, lalu klik atau lepaskan untuk memilihnya dan menyalin nilai HEX atau RGB.",
			"Gambar dibuka secara lokal di browser dan tidak pernah diunggah. Piksel yang sepenuhnya transparan hanya menampilkan opasitasnya tanpa nilai HEX atau RGB.",
		],
		features: [
			"Ambil warna dari gambar PNG, JPEG, dan WebP",
			"Pratinjau langsung saat diarahkan atau disentuh",
			"Salin nilai HEX dan RGB dengan satu klik",
			"Menampilkan opasitas piksel pada gambar transparan",
			"Mendukung mouse dan layar sentuh",
			"Tanpa unggah: gambar tetap di perangkat Anda",
		],
		steps: [
			"Buka sebuah gambar.",
			"Arahkan kursor atau sentuh gambar untuk melihat warna.",
			"Klik untuk memilih warna lalu salin nilai HEX atau RGB.",
		],
		faq: [
			{
				question: "Bisakah mengambil warna dari bagian lain layar?",
				answer:
					"Tidak. Tool ini hanya membaca piksel dari gambar yang Anda buka.",
			},
			{
				question: "Apakah tool ini membuat palet warna?",
				answer: "Tidak. Tool ini memilih satu piksel setiap kali.",
			},
			{
				question: "Apakah gambar saya diunggah?",
				answer: "Tidak. Gambar hanya dibaca di browser Anda.",
			},
		],
	},
} satisfies ToolSeoCopy;
