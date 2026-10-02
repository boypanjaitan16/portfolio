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
