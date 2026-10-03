import type { ToolSeoCopy } from "../../toolSeo";
import { type Locale, useToolsLocale } from "../../toolsLocale";

const en = {
	cardDescription:
		"Arrange pages and add text, images, or a signature. Your files stay in your browser.",
	pdfTitle: "PDF Editor",
	pdfIntro:
		"Arrange pages and add text, images, or a signature. Everything stays in your browser.",
	privacy: "Processed locally · No upload",
	addPdfs: "Add PDFs",
	choosePdfs: "Choose PDF files",
	dropHint: "or drag and drop PDFs here",
	documentPages: "Pages",
	page: "Page",
	pages: "pages",
	noPages: "Add a PDF to start editing.",
	selectPage: "Select page",
	includePage: "Include in selected export",
	moveUp: "Move page up",
	moveDown: "Move page down",
	rotateLeft: "Rotate left",
	rotateRight: "Rotate right",
	deletePage: "Delete page",
	preview: "Preview",
	zoomControls: "Preview zoom",
	zoomIn: "Zoom in",
	zoomOut: "Zoom out",
	resetZoom: "Reset zoom to 100%",
	selectPreview: "Select a page to preview it.",
	annotations: "Add to page",
	addText: "Text",
	addImage: "Image",
	addSignature: "Signature",
	textLabel: "Text",
	textPlaceholder: "Type your text",
	textSize: "Text size",
	color: "Color",
	width: "Width",
	height: "Height",
	positionX: "Horizontal position",
	positionY: "Vertical position",
	removeAnnotation: "Remove annotation",
	signatureTitle: "Draw a signature",
	clearSignature: "Clear",
	useSignature: "Add signature",
	cancel: "Cancel",
	signatureHelp: "Draw with your mouse, finger, or pen.",
	saveAll: "Download PDF",
	saveSelected: "Download selected",
	selectedCount: "selected",
	saving: "Preparing PDF…",
	invalidPdf: "This file is not a valid PDF.",
	encryptedPdf: "Encrypted PDFs cannot be edited here.",
	invalidImage: "Choose a PNG or JPEG image.",
	noSelected: "Select at least one page to export.",
	exportError: "Unable to create the PDF. Please try another file.",
	loadError: "Unable to open this PDF.",
	imageFile: "Choose an image",
	dragHint: "Drag an item to move it. Drag its corner to resize.",
	editAnnotation: "Selected item",
	reset: "Clear workspace",
	loading: "Opening PDF…",
	fileError: "Could not open {name}: {reason}",
	rotate: "Rotation",
	imageAlt: "Added image",
	signatureAlt: "Signature",
	annotationText: "New text",
	pageNumber: "Page {number}",
	outputName: "edited.pdf",
	selectedOutputName: "selected-pages.pdf",
};

const id = {
	cardDescription:
		"Atur halaman dan tambahkan teks, gambar, atau tanda tangan. File tetap di browser Anda.",
	pdfTitle: "Editor PDF",
	pdfIntro:
		"Atur halaman dan tambahkan teks, gambar, atau tanda tangan. Semua diproses di browser Anda.",
	privacy: "Diproses lokal · Tanpa unggah",
	addPdfs: "Tambah PDF",
	choosePdfs: "Pilih file PDF",
	dropHint: "atau tarik PDF ke sini",
	documentPages: "Halaman",
	page: "Halaman",
	pages: "halaman",
	noPages: "Tambahkan PDF untuk mulai mengedit.",
	selectPage: "Pilih halaman",
	includePage: "Sertakan dalam ekspor terpilih",
	moveUp: "Pindahkan halaman ke atas",
	moveDown: "Pindahkan halaman ke bawah",
	rotateLeft: "Putar ke kiri",
	rotateRight: "Putar ke kanan",
	deletePage: "Hapus halaman",
	preview: "Pratinjau",
	zoomControls: "Zoom pratinjau",
	zoomIn: "Perbesar pratinjau",
	zoomOut: "Perkecil pratinjau",
	resetZoom: "Kembalikan zoom ke 100%",
	selectPreview: "Pilih halaman untuk melihat pratinjau.",
	annotations: "Tambahkan ke halaman",
	addText: "Teks",
	addImage: "Gambar",
	addSignature: "Tanda tangan",
	textLabel: "Teks",
	textPlaceholder: "Tulis teks Anda",
	textSize: "Ukuran teks",
	color: "Warna",
	width: "Lebar",
	height: "Tinggi",
	positionX: "Posisi horizontal",
	positionY: "Posisi vertikal",
	removeAnnotation: "Hapus anotasi",
	signatureTitle: "Gambar tanda tangan",
	clearSignature: "Bersihkan",
	useSignature: "Tambah tanda tangan",
	cancel: "Batal",
	signatureHelp: "Gambar dengan mouse, jari, atau pena.",
	saveAll: "Unduh PDF",
	saveSelected: "Unduh terpilih",
	selectedCount: "terpilih",
	saving: "Menyiapkan PDF…",
	invalidPdf: "File ini bukan PDF yang valid.",
	encryptedPdf: "PDF terenkripsi tidak dapat diedit di sini.",
	invalidImage: "Pilih gambar PNG atau JPEG.",
	noSelected: "Pilih setidaknya satu halaman untuk diekspor.",
	exportError: "PDF tidak dapat dibuat. Coba file lain.",
	loadError: "PDF ini tidak dapat dibuka.",
	imageFile: "Pilih gambar",
	dragHint:
		"Tarik item untuk memindahkan. Tarik sudutnya untuk mengubah ukuran.",
	editAnnotation: "Item terpilih",
	reset: "Kosongkan ruang kerja",
	loading: "Membuka PDF…",
	fileError: "Tidak dapat membuka {name}: {reason}",
	rotate: "Rotasi",
	imageAlt: "Gambar yang ditambahkan",
	signatureAlt: "Tanda tangan",
	annotationText: "Teks baru",
	pageNumber: "Halaman {number}",
	outputName: "hasil-edit.pdf",
	selectedOutputName: "halaman-terpilih.pdf",
} satisfies Record<keyof typeof en, string>;

export const pdfTranslations = { en, id } satisfies Record<
	Locale,
	Record<keyof typeof en, string>
>;

export const pdfToolCard = {
	en: { name: en.pdfTitle, description: en.cardDescription },
	id: { name: id.pdfTitle, description: id.cardDescription },
} satisfies Record<Locale, { name: string; description: string }>;

export function usePdfTranslations() {
	return pdfTranslations[useToolsLocale().locale];
}

export const pdfToolSeo = {
	en: {
		metaTitle: "Free Online PDF Editor – Merge, Reorder & Sign PDFs",
		metaDescription:
			"Merge PDFs, reorder, rotate, or remove pages, and add text, images, or a drawn signature. Free, no sign-up, and your files never leave your browser.",
		about: [
			"The PDF Editor combines one or more PDFs into a single document you can rearrange page by page. Rotate, select, reorder, or remove pages, then place text, PNG or JPEG images, and a hand-drawn signature anywhere on a page.",
			"Everything runs in your browser with PDF.js and pdf-lib, so your documents are never uploaded to a server. Export every page or only the pages you select as one PDF.",
		],
		features: [
			"Combine several PDFs into one document",
			"Reorder, rotate, select, and remove pages",
			"Add text, PNG/JPEG images, and drawn signatures",
			"Move and resize annotations on a zoomable preview (50%–300%)",
			"Download all pages or only the selected pages",
			"Private by design: files stay on your device",
		],
		steps: [
			"Add one or more PDF files.",
			"Arrange the pages and add text, images, or a signature.",
			"Download all pages or your selected pages as one PDF.",
		],
		faq: [
			{
				question: "Are my PDFs uploaded anywhere?",
				answer:
					"No. Files are read, previewed, and exported in your browser. Nothing is sent to a server.",
			},
			{
				question: "Is the signature a certified digital signature?",
				answer:
					"No. A drawn signature is added to the page as an image. It is not a certified or cryptographic digital signature.",
			},
			{
				question: "Can I edit existing text or fill in forms?",
				answer:
					"No. The editor does not edit existing text, fill forms, run OCR, or open encrypted PDFs.",
			},
			{
				question: "Does it cost anything?",
				answer: "No. The PDF Editor is free and needs no account.",
			},
		],
	},
	id: {
		metaTitle: "Editor PDF Online Gratis – Gabung, Atur & Tanda Tangani PDF",
		metaDescription:
			"Gabungkan PDF, atur ulang, putar, atau hapus halaman, lalu tambahkan teks, gambar, atau tanda tangan. Gratis, tanpa daftar, dan file tetap di browser Anda.",
		about: [
			"Editor PDF menggabungkan satu atau beberapa PDF menjadi satu dokumen yang dapat Anda atur per halaman. Putar, pilih, urutkan ulang, atau hapus halaman, lalu letakkan teks, gambar PNG atau JPEG, dan tanda tangan yang digambar di mana saja.",
			"Semua proses berjalan di browser Anda dengan PDF.js dan pdf-lib, sehingga dokumen tidak pernah diunggah ke server. Ekspor semua halaman atau hanya halaman yang dipilih sebagai satu PDF.",
		],
		features: [
			"Gabungkan beberapa PDF menjadi satu dokumen",
			"Urutkan ulang, putar, pilih, dan hapus halaman",
			"Tambahkan teks, gambar PNG/JPEG, dan tanda tangan",
			"Pindahkan dan ubah ukuran anotasi pada pratinjau yang dapat diperbesar (50%–300%)",
			"Unduh semua halaman atau hanya halaman terpilih",
			"Privat: file tetap di perangkat Anda",
		],
		steps: [
			"Tambahkan satu atau beberapa file PDF.",
			"Atur halaman, lalu tambahkan teks, gambar, atau tanda tangan.",
			"Unduh semua halaman atau halaman terpilih sebagai satu PDF.",
		],
		faq: [
			{
				question: "Apakah PDF saya diunggah ke suatu tempat?",
				answer:
					"Tidak. File dibaca, ditampilkan, dan diekspor di browser Anda. Tidak ada yang dikirim ke server.",
			},
			{
				question: "Apakah tanda tangannya tanda tangan digital tersertifikasi?",
				answer:
					"Tidak. Tanda tangan yang digambar ditambahkan ke halaman sebagai gambar, bukan tanda tangan digital tersertifikasi atau kriptografis.",
			},
			{
				question:
					"Bisakah saya mengedit teks yang sudah ada atau mengisi formulir?",
				answer:
					"Tidak. Editor ini tidak mengedit teks yang sudah ada, mengisi formulir, menjalankan OCR, atau membuka PDF terenkripsi.",
			},
			{
				question: "Apakah berbayar?",
				answer: "Tidak. Editor PDF gratis dan tidak memerlukan akun.",
			},
		],
	},
} satisfies ToolSeoCopy;
