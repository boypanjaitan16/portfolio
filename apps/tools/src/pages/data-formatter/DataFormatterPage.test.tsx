import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import type { CodeEditorProps } from "./CodeEditor";

// CodeMirror needs layout APIs jsdom lacks; its wrapper has its own test.
vi.mock("./CodeEditor", () => ({
	CodeEditor: ({
		value,
		onChange,
		label,
		readOnly,
		language,
		issues,
	}: CodeEditorProps) => (
		<textarea
			aria-label={label}
			value={value}
			readOnly={readOnly}
			data-language={language}
			data-issues={JSON.stringify(issues ?? [])}
			onChange={(event) => onChange?.(event.target.value)}
		/>
	),
}));

let writeText: ReturnType<typeof vi.fn>;
let downloads: { name: string; blob: Blob }[];

beforeEach(() => {
	window.localStorage.clear();
	downloads = [];
	writeText = vi.fn().mockResolvedValue(undefined);
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: { writeText },
	});
	const blobs = new Map<string, Blob>();
	vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
		const url = `blob:${blobs.size + 1}`;
		blobs.set(url, blob as Blob);
		return url;
	});
	vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
		this: HTMLAnchorElement,
	) {
		downloads.push({ name: this.download, blob: blobs.get(this.href) as Blob });
	});
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

async function renderTool() {
	render(
		<MemoryRouter initialEntries={["/data-formatter"]}>
			<App />
		</MemoryRouter>,
	);
	await screen.findByRole("heading", { name: "Data Formatter & Converter" });
}

function panel(name: string) {
	return screen.getByRole("tabpanel", { name });
}

function editor(scope: HTMLElement, name: "Input" | "Output") {
	return within(scope).getByRole("textbox", { name }) as HTMLTextAreaElement;
}

function textFile(name: string, text: string, size = text.length) {
	const file = new File([text], name);
	Object.defineProperty(file, "text", { value: async () => text });
	Object.defineProperty(file, "size", { value: size });
	return file;
}

it("validates JSON as the user types and marks the error position", async () => {
	await renderTool();
	const format = panel("Format & validate");
	expect(
		within(format).getByText("Paste or open data to validate it."),
	).toBeInTheDocument();
	fireEvent.change(editor(format, "Input"), { target: { value: '{"a":1,}' } });
	expect(
		await within(format).findByText(
			'Invalid JSON. Line 1, column 8: Unexpected character "}".',
		),
	).toBeInTheDocument();
	expect(JSON.parse(editor(format, "Input").dataset.issues ?? "")).toEqual([
		{ line: 1, column: 8, message: 'Unexpected character "}".' },
	]);
	fireEvent.change(editor(format, "Input"), {
		target: { value: '{"b":1,"a":[2],"a":3}' },
	});
	expect(await within(format).findByText("Valid JSON.")).toBeInTheDocument();
	expect(within(format).getByText(/Duplicate key "a"/)).toBeInTheDocument();
});

it("formats, minifies, sorts, and reuses JSON output", async () => {
	await renderTool();
	const format = panel("Format & validate");
	fireEvent.change(editor(format, "Input"), {
		target: { value: '{"b":1,"a":[1.50]}' },
	});
	const click = (name: string) =>
		fireEvent.click(within(format).getByRole("button", { name }));
	click("Format");
	expect(editor(format, "Output").value).toBe(
		'{\n  "b": 1,\n  "a": [\n    1.50\n  ]\n}',
	);
	fireEvent.change(within(format).getByRole("combobox", { name: "Indent" }), {
		target: { value: "tab" },
	});
	click("Minify");
	expect(editor(format, "Output").value).toBe('{"b":1,"a":[1.50]}');
	click("Sort keys");
	expect(editor(format, "Output").value).toBe(
		'{\n\t"a": [\n\t\t1.5\n\t],\n\t"b": 1\n}',
	);
	expect(within(format).queryByRole("button", { name: /Convert/ })).toBeNull();

	click("Use as input");
	expect(editor(format, "Input").value).toBe(
		'{\n\t"a": [\n\t\t1.5\n\t],\n\t"b": 1\n}',
	);
	expect(editor(format, "Output").value).toBe("");
	expect(within(format).getByRole("combobox", { name: "Format" })).toHaveValue(
		"json",
	);
});

it("shows an action error immediately, even before validation runs", async () => {
	await renderTool();
	const format = panel("Format & validate");
	fireEvent.change(editor(format, "Input"), { target: { value: "[1," } });
	fireEvent.click(within(format).getByRole("button", { name: "Format" }));
	expect(
		within(format).getByText(
			"Invalid JSON. Line 1, column 4: The JSON ends too early.",
		),
	).toBeInTheDocument();
	expect(editor(format, "Output").value).toBe("");
});

it("auto-detects XML, formats it, copies, and downloads the result", async () => {
	await renderTool();
	const format = panel("Format & validate");
	fireEvent.change(editor(format, "Input"), {
		target: { value: "<a><b>1</b></a>" },
	});
	expect(
		within(format).getByRole("option", { name: "Auto-detect (XML)" }),
	).toBeInTheDocument();
	expect(
		within(format).queryByRole("button", { name: "Sort keys" }),
	).toBeNull();
	fireEvent.click(within(format).getByRole("button", { name: "Format" }));
	expect(editor(format, "Output").value).toBe("<a>\n  <b>1</b>\n</a>");
	fireEvent.click(within(format).getByRole("button", { name: "Copy" }));
	expect(
		await within(format).findByText("Copied to the clipboard."),
	).toBeInTheDocument();
	expect(writeText).toHaveBeenCalledWith("<a>\n  <b>1</b>\n</a>");
	fireEvent.click(within(format).getByRole("button", { name: "Download" }));
	expect(downloads[0].name).toBe("data.xml");
	expect(downloads[0].blob.type).toBe("application/xml;charset=utf-8");
});

it("opens files, detects YAML by extension, and rejects large files in the format tab", async () => {
	await renderTool();
	const format = panel("Format & validate");
	const input = within(format).getByLabelText("Open file", {
		selector: "input",
	});
	fireEvent.change(input, {
		target: { files: [textFile("config.yml", "a:   1\n")] },
	});
	await waitFor(() => expect(editor(format, "Input").value).toBe("a:   1\n"));
	expect(
		within(format).getByRole("option", { name: "Auto-detect (YAML)" }),
	).toBeInTheDocument();
	fireEvent.click(within(format).getByRole("button", { name: "Format" }));
	expect(editor(format, "Output").value).toBe("a: 1\n");
	fireEvent.click(within(format).getByRole("button", { name: "Download" }));
	expect(downloads[0].name).toBe("config.yaml");

	fireEvent.change(input, {
		target: { files: [textFile("huge.json", "{}", 6 * 1024 * 1024)] },
	});
	expect(await within(format).findByRole("alert")).toHaveTextContent(
		"This file is larger than 5 MB.",
	);
});

it("converts CSV to JSON live and back again with options", async () => {
	await renderTool();
	const tab = screen.getByRole("tab", { name: "Format & validate" });
	fireEvent.keyDown(tab, { key: "ArrowRight" });
	expect(screen.getByRole("tab", { name: "Convert" })).toHaveAttribute(
		"aria-selected",
		"true",
	);
	// Hidden panels have no accessible name, so look the panel up by id.
	expect(
		document.getElementById("data-formatter-panel-format"),
	).not.toBeVisible();
	const csv = panel("Convert");
	fireEvent.change(editor(csv, "Input"), {
		target: { value: "id;name\n1;Ana\n2" },
	});
	await waitFor(() =>
		expect(JSON.parse(editor(csv, "Output").value)).toEqual([
			{ id: 1, name: "Ana" },
			{ id: 2, name: "" },
		]),
	);
	expect(
		within(csv).getByText("Line 3: This row has 1 fields instead of 2."),
	).toBeInTheDocument();

	fireEvent.click(
		within(csv).getByRole("checkbox", { name: /Detect numbers/ }),
	);
	await waitFor(() =>
		expect(JSON.parse(editor(csv, "Output").value)[0].id).toBe("1"),
	);

	fireEvent.click(
		within(csv).getByRole("button", { name: "Swap input and output" }),
	);
	expect(
		within(csv).getByRole("button", { name: "JSON → CSV" }),
	).toHaveAttribute("aria-pressed", "true");
	await waitFor(() =>
		expect(editor(csv, "Output").value).toBe("id,name\n1,Ana\n2,"),
	);
	fireEvent.change(editor(csv, "Input"), {
		target: { value: '[{"a":{"b":1}}]' },
	});
	await waitFor(() => expect(editor(csv, "Output").value).toBe("a.b\n1"));
	fireEvent.click(within(csv).getByRole("checkbox", { name: /Flatten/ }));
	await waitFor(() =>
		expect(editor(csv, "Output").value).toBe('a\n"{""b"":1}"'),
	);
	fireEvent.click(within(csv).getByRole("button", { name: "Download" }));
	expect(downloads[0].name).toBe("data.csv");
});

it("converts JSON and YAML in both directions and keeps YAML indentation valid", async () => {
	await renderTool();
	fireEvent.click(screen.getByRole("tab", { name: "Convert" }));
	const convert = panel("Convert");
	fireEvent.click(within(convert).getByRole("button", { name: "JSON → YAML" }));
	expect(
		within(convert).queryByRole("combobox", { name: "Delimiter" }),
	).toBeNull();
	expect(
		within(convert).queryByRole("option", { name: "Tab" }),
	).not.toBeInTheDocument();
	expect(editor(convert, "Input").dataset.language).toBe("json");
	fireEvent.change(editor(convert, "Input"), {
		target: { value: '{"a":[1,{"b":null}]}' },
	});
	await waitFor(() =>
		expect(editor(convert, "Output").value).toBe("a:\n  - 1\n  - b: null\n"),
	);
	expect(editor(convert, "Output").dataset.language).toBe("yaml");
	fireEvent.click(within(convert).getByRole("button", { name: "Download" }));
	expect(downloads[0].name).toBe("data.yaml");

	fireEvent.click(
		within(convert).getByRole("button", { name: "Swap input and output" }),
	);
	expect(
		within(convert).getByRole("button", { name: "YAML → JSON" }),
	).toHaveAttribute("aria-pressed", "true");
	await waitFor(() =>
		expect(JSON.parse(editor(convert, "Output").value)).toEqual({
			a: [1, { b: null }],
		}),
	);

	fireEvent.change(editor(convert, "Input"), {
		target: { value: "a: 1\na: 2" },
	});
	expect(
		await within(convert).findByText(
			"Line 2, column 1: Map keys must be unique",
		),
	).toBeInTheDocument();
});

it("picks the conversion direction from an opened file", async () => {
	await renderTool();
	fireEvent.click(screen.getByRole("tab", { name: "Convert" }));
	const convert = panel("Convert");
	const input = within(convert).getByLabelText("Open file", {
		selector: "input",
	});
	fireEvent.change(input, {
		target: { files: [textFile("site.yml", "name: Ana\n")] },
	});
	await waitFor(() =>
		expect(
			within(convert).getByRole("button", { name: "YAML → JSON" }),
		).toHaveAttribute("aria-pressed", "true"),
	);
	fireEvent.change(input, {
		target: { files: [textFile("rows.tsv", "a\tb\n1\t2")] },
	});
	await waitFor(() =>
		expect(JSON.parse(editor(convert, "Output").value)).toEqual([
			{ a: 1, b: 2 },
		]),
	);
	expect(
		within(convert).getByRole("combobox", { name: "Delimiter" }),
	).toHaveValue("\t");
});

it("reports CSV quote errors with their position", async () => {
	await renderTool();
	fireEvent.click(screen.getByRole("tab", { name: "Convert" }));
	const csv = panel("Convert");
	fireEvent.change(editor(csv, "Input"), { target: { value: 'a\n"open' } });
	expect(
		await within(csv).findByText(
			"Line 2, column 1: This quoted field is never closed.",
		),
	).toBeInTheDocument();
	expect(editor(csv, "Output").value).toBe("");
});

it("uses Indonesian copy with the saved locale", async () => {
	window.localStorage.setItem("portfolio-locale", "id");
	render(
		<MemoryRouter initialEntries={["/data-formatter"]}>
			<App />
		</MemoryRouter>,
	);
	expect(
		await screen.findByRole("heading", { name: "Format & Konversi Data" }),
	).toBeInTheDocument();
	const format = screen.getByRole("tabpanel", { name: "Rapikan & validasi" });
	fireEvent.change(within(format).getByRole("textbox", { name: "Masukan" }), {
		target: { value: "[1,]" },
	});
	expect(
		await within(format).findByText(
			'JSON tidak valid. Baris 1, kolom 4: Karakter tidak terduga "]".',
		),
	).toBeInTheDocument();
});
