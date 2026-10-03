import type { ToolSeoCopy } from "../../toolSeo";
import { type Locale, useToolsLocale } from "../../toolsLocale";

const en = {
	title: "Spinning Wheel",
	cardDescription: "Draw names fairly and remove each winner from the wheel.",
	intro: "Add entries, set their colors, and spin to draw one at a time.",
	privacy: "Saved in this browser · No upload",
	wheel: "Wheel",
	wheelPreview: "Spinning wheel with the current entries",
	emptyWheel: "Add an item to start the draw.",
	labelsInList: "Entry names are shown in the list beside the wheel.",
	spin: "Spin the wheel",
	spinning: "Spinning…",
	winner: "Winner",
	winnerPending: "Confirm to remove {name} from the wheel.",
	confirmWinner: "Confirm winner",
	spinError: "The wheel could not select a winner. Please try again.",
	items: "Items",
	itemCount: "{count} remaining",
	addItem: "Add item",
	itemName: "Item name",
	itemPlaceholder: "Enter a name",
	add: "Add",
	bulkTitle: "Add several items",
	bulkHint: "Paste one item per line. Blank lines are ignored.",
	bulkPlaceholder: "One item per line",
	addMany: "Add items",
	addedCount: "{count} items added.",
	required: "Enter a name first.",
	duplicate: "That name is already on the wheel.",
	duplicatesSkipped: "Skipped duplicate names: {names}.",
	color: "Color for {name}",
	edit: "Edit {name}",
	remove: "Remove {name}",
	save: "Save",
	cancel: "Cancel",
	storageError:
		"Browser storage is unavailable. Changes will be lost when this page closes.",
};

const id = {
	title: "Roda Undian",
	cardDescription: "Undi nama secara adil dan hapus setiap pemenang dari roda.",
	intro:
		"Tambahkan item, atur warnanya, lalu putar roda untuk mengundi satu per satu.",
	privacy: "Disimpan di browser ini · Tanpa unggah",
	wheel: "Roda",
	wheelPreview: "Roda undian berisi item saat ini",
	emptyWheel: "Tambahkan item untuk memulai undian.",
	labelsInList: "Nama item ditampilkan pada daftar di samping roda.",
	spin: "Putar roda",
	spinning: "Memutar…",
	winner: "Pemenang",
	winnerPending: "Konfirmasi untuk menghapus {name} dari roda.",
	confirmWinner: "Konfirmasi pemenang",
	spinError: "Roda tidak dapat memilih pemenang. Coba lagi.",
	items: "Item",
	itemCount: "{count} tersisa",
	addItem: "Tambah item",
	itemName: "Nama item",
	itemPlaceholder: "Masukkan nama",
	add: "Tambah",
	bulkTitle: "Tambah beberapa item",
	bulkHint: "Tempel satu item per baris. Baris kosong diabaikan.",
	bulkPlaceholder: "Satu item per baris",
	addMany: "Tambah item",
	addedCount: "{count} item ditambahkan.",
	required: "Masukkan nama terlebih dahulu.",
	duplicate: "Nama tersebut sudah ada di roda.",
	duplicatesSkipped: "Nama duplikat dilewati: {names}.",
	color: "Warna untuk {name}",
	edit: "Ubah {name}",
	remove: "Hapus {name}",
	save: "Simpan",
	cancel: "Batal",
	storageError:
		"Penyimpanan browser tidak tersedia. Perubahan akan hilang saat halaman ditutup.",
} satisfies Record<keyof typeof en, string>;

export const spinningWheelTranslations = { en, id } satisfies Record<
	Locale,
	Record<keyof typeof en, string>
>;

export const spinningWheelCard = {
	en: { name: en.title, description: en.cardDescription },
	id: { name: id.title, description: id.cardDescription },
} satisfies Record<Locale, { name: string; description: string }>;

export function useSpinningWheelTranslations() {
	return spinningWheelTranslations[useToolsLocale().locale];
}

export const spinningWheelSeo = {
	en: {
		metaTitle: "Spinning Wheel – Random Name Picker Online",
		metaDescription:
			"Spin a wheel to pick a random name or item. Add items one by one or in bulk, choose colors, and remove winners. Free, no account, saved in your browser.",
		about: [
			"The Spinning Wheel picks one item at a time from your own list. Every item gets an equal slice, so each spin is fair. The winner appears in a confetti dialog, and you decide whether to remove it before the next spin.",
			"Add items individually or paste one per line, rename them, and choose each slice's color. Your list is saved in this browser's local storage, with no account or server involved.",
		],
		features: [
			"Equal-sized slices for a fair random draw",
			"Add items one by one or one per line",
			"Edit names and choose each slice's color",
			"Confetti result with optional winner removal",
			"List saved in your browser between visits",
			"No sign-up and no server",
		],
		steps: [
			"Add the names or items you want to draw from.",
			"Spin the wheel.",
			"Keep or remove the winner and spin again.",
		],
		faq: [
			{
				question: "Is the result random?",
				answer:
					"Yes. Every remaining item has one equal-sized slice and the same chance of being picked.",
			},
			{
				question: "Is my list saved?",
				answer:
					"Yes, in this browser's local storage only. It is not sent anywhere, and winner history is not kept.",
			},
			{
				question: "Can two items have the same name?",
				answer:
					"No. Names must be unique, ignoring extra spaces and letter case.",
			},
		],
	},
	id: {
		metaTitle: "Roda Undian – Pengundi Nama Acak Online",
		metaDescription:
			"Putar roda untuk memilih nama atau item secara acak. Tambahkan item satu per satu atau sekaligus, pilih warna, dan hapus pemenang. Gratis, tersimpan di browser.",
		about: [
			"Roda Undian memilih satu item setiap kali dari daftar Anda sendiri. Setiap item mendapat potongan yang sama besar, sehingga setiap putaran adil. Pemenang tampil dalam dialog konfeti, dan Anda memutuskan apakah item itu dihapus sebelum putaran berikutnya.",
			"Tambahkan item satu per satu atau tempel satu item per baris, ubah namanya, dan pilih warna setiap potongan. Daftar disimpan di penyimpanan lokal browser ini, tanpa akun atau server.",
		],
		features: [
			"Potongan berukuran sama untuk undian yang adil",
			"Tambahkan item satu per satu atau satu per baris",
			"Ubah nama dan pilih warna setiap potongan",
			"Hasil dengan konfeti dan opsi menghapus pemenang",
			"Daftar tersimpan di browser untuk kunjungan berikutnya",
			"Tanpa daftar akun dan tanpa server",
		],
		steps: [
			"Tambahkan nama atau item yang ingin diundi.",
			"Putar rodanya.",
			"Simpan atau hapus pemenang, lalu putar lagi.",
		],
		faq: [
			{
				question: "Apakah hasilnya acak?",
				answer:
					"Ya. Setiap item yang tersisa memiliki satu potongan berukuran sama dan peluang yang sama untuk terpilih.",
			},
			{
				question: "Apakah daftar saya disimpan?",
				answer:
					"Ya, hanya di penyimpanan lokal browser ini. Daftar tidak dikirim ke mana pun dan riwayat pemenang tidak disimpan.",
			},
			{
				question: "Bisakah dua item memiliki nama yang sama?",
				answer:
					"Tidak. Nama harus unik, tanpa memperhatikan spasi tambahan dan huruf besar-kecil.",
			},
		],
	},
} satisfies ToolSeoCopy;
