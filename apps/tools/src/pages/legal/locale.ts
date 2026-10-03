import type { Locale } from "../../toolsLocale";

const en = {
	pageLabel: "About these tools",
	backToTools: "Back to tools",
	contactLink: "portfolio contact form",
	contactNote:
		"That form is separate from Tools and sends the details you submit to the portfolio's contact service.",
	relatedPages: "Related policy",
	privacy: {
		title: "Privacy Policy",
		intro:
			"This policy applies to the tools at boypanjaitan.com/tools/. The portfolio contact form and admin app are separate services.",
		processingTitle: "Your work stays in your browser",
		processingBody:
			"Files, images, text, URLs, wheel entries, and generated results are processed on your device. The tools do not upload your input or generated files to a server. Downloads are created in your browser.",
		storageTitle: "What this browser saves",
		storageBody:
			"Local storage keeps your language choice and the Spinning Wheel's item names and colors on this browser and device. Other tool inputs are not saved by Tools. You can remove the saved choices by clearing this site's browser data.",
		hostingTitle: "Loading the site",
		hostingBefore:
			"Your browser requests the pages and assets needed to run Tools from GitHub Pages. GitHub says it logs visitors' IP addresses for security. These requests do not include the content you enter into the tools. See ",
		hostingLink: "GitHub Pages documentation",
		hostingAfter: " for details.",
		contactTitle: "Questions",
		contactBefore: "You can reach me through the ",
		contactAfter: ".",
		relatedLink: "Read the Terms of Service",
	},
	terms: {
		title: "Terms of Service",
		intro:
			"These terms apply to the free browser tools at boypanjaitan.com/tools/. By using a tool, you agree to these terms.",
		useTitle: "Using the tools",
		useBody:
			"Use the tools for content you are allowed to handle and in ways that follow applicable law. Processing happens in your browser; the tools do not upload your input or generated files.",
		responsibilityTitle: "Check and keep your results",
		responsibilityBody:
			"You are responsible for the content you enter and the results you use. Check generated PDFs, edited images, QR codes, colors, and draw results before relying on or sharing them. Keep your own copies of important files and lists; browser storage can be cleared.",
		availabilityTitle: "Availability",
		availabilityBody:
			"The tools are provided as available. Features may change or become unavailable, and uninterrupted operation or suitability for a particular purpose is not guaranteed.",
		contactTitle: "Questions",
		contactBefore: "You can reach me through the ",
		contactAfter: ".",
		relatedLink: "Read the Privacy Policy",
	},
};

const id = {
	pageLabel: "Tentang tools ini",
	backToTools: "Kembali ke tools",
	contactLink: "formulir kontak portofolio",
	contactNote:
		"Formulir tersebut terpisah dari Tools dan mengirimkan data yang Anda isi ke layanan kontak portofolio.",
	relatedPages: "Kebijakan terkait",
	privacy: {
		title: "Kebijakan Privasi",
		intro:
			"Kebijakan ini berlaku untuk tools di boypanjaitan.com/tools/. Formulir kontak portofolio dan aplikasi admin adalah layanan terpisah.",
		processingTitle: "Pekerjaan Anda tetap di browser",
		processingBody:
			"File, gambar, teks, URL, item roda undian, dan hasil yang dibuat diproses di perangkat Anda. Tools tidak mengunggah input atau file hasil ke server. Unduhan dibuat di browser Anda.",
		storageTitle: "Yang disimpan browser ini",
		storageBody:
			"Penyimpanan lokal menyimpan pilihan bahasa serta nama dan warna item Roda Undian di browser dan perangkat ini. Input tool lainnya tidak disimpan oleh Tools. Anda dapat menghapusnya dengan membersihkan data situs di browser.",
		hostingTitle: "Memuat situs",
		hostingBefore:
			"Browser Anda meminta halaman dan aset yang diperlukan untuk menjalankan Tools dari GitHub Pages. GitHub menyatakan bahwa alamat IP pengunjung dicatat untuk keamanan. Permintaan ini tidak menyertakan isi yang Anda masukkan ke tools. Lihat ",
		hostingLink: "dokumentasi GitHub Pages",
		hostingAfter: " untuk informasi lebih lanjut.",
		contactTitle: "Pertanyaan",
		contactBefore: "Anda dapat menghubungi saya melalui ",
		contactAfter: ".",
		relatedLink: "Baca Ketentuan Layanan",
	},
	terms: {
		title: "Ketentuan Layanan",
		intro:
			"Ketentuan ini berlaku untuk tools browser gratis di boypanjaitan.com/tools/. Dengan menggunakan tool, Anda menyetujui ketentuan ini.",
		useTitle: "Menggunakan tools",
		useBody:
			"Gunakan tools untuk konten yang berhak Anda kelola dan sesuai hukum yang berlaku. Pemrosesan dilakukan di browser; tools tidak mengunggah input atau file hasil Anda.",
		responsibilityTitle: "Periksa dan simpan hasil Anda",
		responsibilityBody:
			"Anda bertanggung jawab atas konten yang dimasukkan dan hasil yang digunakan. Periksa PDF, gambar yang diedit, kode QR, warna, dan hasil undian sebelum mengandalkan atau membagikannya. Simpan salinan sendiri untuk file dan daftar penting; penyimpanan browser dapat terhapus.",
		availabilityTitle: "Ketersediaan",
		availabilityBody:
			"Tools disediakan sesuai ketersediaan. Fitur dapat berubah atau tidak tersedia, dan kelancaran tanpa gangguan maupun kecocokan untuk tujuan tertentu tidak dijamin.",
		contactTitle: "Pertanyaan",
		contactBefore: "Anda dapat menghubungi saya melalui ",
		contactAfter: ".",
		relatedLink: "Baca Kebijakan Privasi",
	},
} satisfies typeof en;

export const legalCopy = { en, id } satisfies Record<Locale, typeof en>;
