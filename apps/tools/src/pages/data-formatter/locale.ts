import type { ToolSeoCopy } from "../../toolSeo";
import { type Locale, useToolsLocale } from "../../toolsLocale";

const en = {
	title: "Data Formatter & Converter",
	cardDescription:
		"Format and validate JSON, YAML, or XML, and convert CSV ↔ JSON or JSON ↔ YAML.",
	intro:
		"Paste or open data to check it, tidy it up, or convert it. Everything runs in this browser.",
	loading: "Loading editor…",
	tabFormat: "Format & validate",
	tabConvert: "Convert",
	openFile: "Open file",
	dropHint: "Drop a file on an editor to open it.",
	fileTooLarge: "This file is larger than 5 MB.",
	fileUnreadable: "This file could not be read as text.",
	input: "Input",
	output: "Output",
	inputPlaceholder: "Paste JSON, YAML, or XML here…",
	outputPlaceholder: "Results appear here.",
	format: "Format",
	format_auto: "Auto-detect ({detected})",
	format_json: "JSON",
	format_yaml: "YAML",
	format_xml: "XML",
	indent: "Indent",
	indent_2: "2 spaces",
	indent_4: "4 spaces",
	indent_tab: "Tab",
	yamlTabNote: "YAML does not allow tab indentation, so 2 spaces are used.",
	actionFormat: "Format",
	actionMinify: "Minify",
	actionSortKeys: "Sort keys",
	statusEmpty: "Paste or open data to validate it.",
	statusChecking: "Checking…",
	statusValid: "Valid {format}.",
	statusInvalid: "Invalid {format}.",
	location: "Line {line}, column {column}: ",
	locationLine: "Line {line}: ",
	warnings: "Notes",
	copy: "Copy",
	copied: "Copied to the clipboard.",
	copyFailed: "Could not copy. Select the text and copy it manually.",
	download: "Download",
	useAsInput: "Use as input",
	direction: "Direction",
	direction_csvToJson: "CSV → JSON",
	direction_jsonToCsv: "JSON → CSV",
	direction_jsonToYaml: "JSON → YAML",
	direction_yamlToJson: "YAML → JSON",
	csvPlaceholder: "Paste CSV here…",
	jsonPlaceholder: "Paste JSON here…",
	yamlPlaceholder: "Paste YAML here…",
	delimiter: "Delimiter",
	delimiter_auto: "Auto-detect",
	delimiter_comma: "Comma (,)",
	delimiter_semicolon: "Semicolon (;)",
	delimiter_tab: "Tab",
	delimiter_pipe: "Pipe (|)",
	header: "First row is a header",
	headerOut: "Include a header row",
	inferTypes: "Detect numbers, true/false, and null",
	flatten: "Flatten nested objects (a.b)",
	swap: "Swap input and output",
	issue_jsonUnexpectedEnd: "The JSON ends too early.",
	issue_jsonUnexpectedChar: "Unexpected character {char}.",
	issue_jsonInvalidNumber: "Invalid number.",
	issue_jsonInvalidString:
		"Strings cannot contain unescaped control characters such as tabs or line breaks.",
	issue_jsonInvalidEscape: "Invalid escape sequence.",
	issue_jsonTooDeep: "The data is nested too deeply.",
	issue_jsonDuplicateKey:
		"Duplicate key {key}. Formatting keeps both; converting or sorting keeps the last value.",
	issue_precisionLoss:
		"Some numbers cannot be represented exactly in JavaScript and were rounded, or became null.",
	issue_multiDocument:
		"The YAML has {count} documents, so the JSON is an array of them.",
	issue_csvUnclosedQuote: "This quoted field is never closed.",
	issue_csvUnexpectedQuote:
		"A closing quote must be followed by a delimiter or a line break.",
	issue_csvRaggedRow: "This row has {actual} fields instead of {expected}.",
	issue_csvShape:
		"JSON → CSV needs an array of objects, an array of arrays, an array of values, or one object.",
};

const id = {
	title: "Format & Konversi Data",
	cardDescription:
		"Rapikan dan validasi JSON, YAML, atau XML, serta konversi CSV ↔ JSON atau JSON ↔ YAML.",
	intro:
		"Tempel atau buka data untuk memeriksa, merapikan, atau mengonversinya. Semuanya berjalan di browser ini.",
	loading: "Memuat editor…",
	tabFormat: "Rapikan & validasi",
	tabConvert: "Konversi",
	openFile: "Buka file",
	dropHint: "Tarik file ke editor untuk membukanya.",
	fileTooLarge: "File ini lebih besar dari 5 MB.",
	fileUnreadable: "File ini tidak dapat dibaca sebagai teks.",
	input: "Masukan",
	output: "Hasil",
	inputPlaceholder: "Tempel JSON, YAML, atau XML di sini…",
	outputPlaceholder: "Hasil muncul di sini.",
	format: "Format",
	format_auto: "Deteksi otomatis ({detected})",
	format_json: "JSON",
	format_yaml: "YAML",
	format_xml: "XML",
	indent: "Indentasi",
	indent_2: "2 spasi",
	indent_4: "4 spasi",
	indent_tab: "Tab",
	yamlTabNote: "YAML tidak mengizinkan indentasi tab, jadi digunakan 2 spasi.",
	actionFormat: "Rapikan",
	actionMinify: "Perkecil",
	actionSortKeys: "Urutkan kunci",
	statusEmpty: "Tempel atau buka data untuk memvalidasinya.",
	statusChecking: "Memeriksa…",
	statusValid: "{format} valid.",
	statusInvalid: "{format} tidak valid.",
	location: "Baris {line}, kolom {column}: ",
	locationLine: "Baris {line}: ",
	warnings: "Catatan",
	copy: "Salin",
	copied: "Disalin ke papan klip.",
	copyFailed: "Tidak dapat menyalin. Pilih teks lalu salin secara manual.",
	download: "Unduh",
	useAsInput: "Jadikan masukan",
	direction: "Arah",
	direction_csvToJson: "CSV → JSON",
	direction_jsonToCsv: "JSON → CSV",
	direction_jsonToYaml: "JSON → YAML",
	direction_yamlToJson: "YAML → JSON",
	csvPlaceholder: "Tempel CSV di sini…",
	jsonPlaceholder: "Tempel JSON di sini…",
	yamlPlaceholder: "Tempel YAML di sini…",
	delimiter: "Pemisah",
	delimiter_auto: "Deteksi otomatis",
	delimiter_comma: "Koma (,)",
	delimiter_semicolon: "Titik koma (;)",
	delimiter_tab: "Tab",
	delimiter_pipe: "Garis tegak (|)",
	header: "Baris pertama adalah judul kolom",
	headerOut: "Sertakan baris judul kolom",
	inferTypes: "Deteksi angka, true/false, dan null",
	flatten: "Ratakan objek bersarang (a.b)",
	swap: "Tukar masukan dan hasil",
	issue_jsonUnexpectedEnd: "JSON berakhir terlalu cepat.",
	issue_jsonUnexpectedChar: "Karakter tidak terduga {char}.",
	issue_jsonInvalidNumber: "Angka tidak valid.",
	issue_jsonInvalidString:
		"String tidak boleh berisi karakter kontrol tanpa escape, seperti tab atau baris baru.",
	issue_jsonInvalidEscape: "Urutan escape tidak valid.",
	issue_jsonTooDeep: "Data bersarang terlalu dalam.",
	issue_jsonDuplicateKey:
		"Kunci ganda {key}. Merapikan mempertahankan keduanya; konversi atau pengurutan memakai nilai terakhir.",
	issue_precisionLoss:
		"Beberapa angka tidak dapat direpresentasikan tepat di JavaScript sehingga dibulatkan atau menjadi null.",
	issue_multiDocument:
		"YAML berisi {count} dokumen, jadi JSON berupa array dari dokumen tersebut.",
	issue_csvUnclosedQuote: "Kolom bertanda kutip ini tidak pernah ditutup.",
	issue_csvUnexpectedQuote:
		"Tanda kutip penutup harus diikuti pemisah atau baris baru.",
	issue_csvRaggedRow: "Baris ini memiliki {actual} kolom, bukan {expected}.",
	issue_csvShape:
		"JSON → CSV memerlukan array objek, array dari array, array nilai, atau satu objek.",
} satisfies Record<keyof typeof en, string>;

export const dataFormatterTranslations = { en, id } satisfies Record<
	Locale,
	Record<keyof typeof en, string>
>;

export const dataFormatterCard = {
	en: { name: en.title, description: en.cardDescription },
	id: { name: id.title, description: id.cardDescription },
} satisfies Record<Locale, { name: string; description: string }>;

export function useDataFormatterTranslations() {
	return dataFormatterTranslations[useToolsLocale().locale];
}

export const dataFormatterSeo = {
	en: {
		metaTitle: "JSON, YAML & XML Formatter and CSV ↔ JSON Converter",
		metaDescription:
			"Format, validate, and minify JSON, YAML, and XML with line-precise errors, and convert CSV to JSON, JSON to CSV, or JSON to YAML. Free and in your browser.",
		about: [
			"The Data Formatter & Converter tidies and checks JSON, YAML, and XML in a code editor with line numbers, folding, and search. Format type is detected automatically, and errors point to the exact line and column.",
			"The Convert tab turns CSV into JSON, JSON into CSV, JSON into YAML, and YAML into JSON as you type. Paste text, open a file up to 5 MB, or drop it on the editor. Nothing is saved or uploaded.",
		],
		features: [
			"Format, minify, and validate JSON, YAML, and XML",
			"Errors with exact line and column",
			"JSON key sorting and duplicate-key notes",
			"CSV ↔ JSON with delimiter and type detection",
			"JSON ↔ YAML conversion, including multi-document YAML",
			"Runs locally with no upload",
		],
		steps: [
			"Paste your data, open a file, or drop it on the editor.",
			"Format, minify, or choose a conversion direction.",
			"Copy or download the result.",
		],
		faq: [
			{
				question: "Is my data sent to a server?",
				answer:
					"No. Formatting, validation, and conversion run in your browser, and nothing is saved.",
			},
			{
				question: "Can it convert XML to JSON?",
				answer:
					"No. XML can be formatted and validated, but there is no single standard mapping from XML to other formats.",
			},
			{
				question: "Will large numbers lose precision?",
				answer:
					"Formatting and minifying keep number literals exactly. Sorting keys and conversions warn you when a number would be rounded.",
			},
		],
	},
	id: {
		metaTitle: "Formatter JSON, YAML & XML serta Konverter CSV ↔ JSON",
		metaDescription:
			"Rapikan, validasi, dan perkecil JSON, YAML, serta XML dengan galat per baris, dan ubah CSV ke JSON, JSON ke CSV, atau JSON ke YAML. Gratis dan di browser.",
		about: [
			"Format & Konversi Data merapikan dan memeriksa JSON, YAML, dan XML di editor kode dengan nomor baris, lipatan, dan pencarian. Jenis format terdeteksi otomatis, dan galat menunjukkan baris serta kolom yang tepat.",
			"Tab Konversi mengubah CSV ke JSON, JSON ke CSV, JSON ke YAML, dan YAML ke JSON saat Anda mengetik. Tempel teks, buka file hingga 5 MB, atau seret ke editor. Tidak ada yang disimpan atau diunggah.",
		],
		features: [
			"Rapikan, perkecil, dan validasi JSON, YAML, dan XML",
			"Galat dengan baris dan kolom yang tepat",
			"Pengurutan kunci JSON dan catatan kunci ganda",
			"CSV ↔ JSON dengan deteksi pemisah dan tipe data",
			"Konversi JSON ↔ YAML, termasuk YAML multi-dokumen",
			"Berjalan lokal tanpa unggah",
		],
		steps: [
			"Tempel data, buka file, atau seret ke editor.",
			"Rapikan, perkecil, atau pilih arah konversi.",
			"Salin atau unduh hasilnya.",
		],
		faq: [
			{
				question: "Apakah data saya dikirim ke server?",
				answer:
					"Tidak. Perapian, validasi, dan konversi berjalan di browser Anda, dan tidak ada yang disimpan.",
			},
			{
				question: "Bisakah mengubah XML ke JSON?",
				answer:
					"Tidak. XML dapat dirapikan dan divalidasi, tetapi tidak ada satu pemetaan standar dari XML ke format lain.",
			},
			{
				question: "Apakah angka besar kehilangan presisi?",
				answer:
					"Perapian dan perkecilan mempertahankan angka persis. Pengurutan kunci dan konversi memberi peringatan jika angka akan dibulatkan.",
			},
		],
	},
} satisfies ToolSeoCopy;
