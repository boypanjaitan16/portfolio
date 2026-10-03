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
