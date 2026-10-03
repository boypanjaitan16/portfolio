import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";
import { CodeEditor, type EditorLanguage } from "./CodeEditor";
import type { Delimiter } from "./csv";
import { csvToJson, type DelimiterChoice, jsonToCsv } from "./csvJson";
import {
	baseName,
	type DataFormatterText,
	editorIssues,
	FileDropZone,
	type FileError,
	IssueList,
	issueText,
	OpenFileButton,
	OutputActions,
	readTextFile,
	useDebouncedValue,
} from "./panelParts";
import { type Indent, indentText, type Result } from "./result";
import { jsonToYaml, yamlToJson } from "./yamlFormat";

type Direction = "csvToJson" | "jsonToCsv" | "jsonToYaml" | "yamlToJson";
type Side = "csv" | "json" | "yaml";

const directions: Direction[] = [
	"csvToJson",
	"jsonToCsv",
	"jsonToYaml",
	"yamlToJson",
];
const sides: Record<Direction, { from: Side; to: Side; reverse: Direction }> = {
	csvToJson: { from: "csv", to: "json", reverse: "jsonToCsv" },
	jsonToCsv: { from: "json", to: "csv", reverse: "csvToJson" },
	jsonToYaml: { from: "json", to: "yaml", reverse: "yamlToJson" },
	yamlToJson: { from: "yaml", to: "json", reverse: "jsonToYaml" },
};
const languages: Record<Side, EditorLanguage> = {
	csv: "text",
	json: "json",
	yaml: "yaml",
};
const mimeTypes: Record<Side, string> = {
	csv: "text/csv",
	json: "application/json",
	yaml: "application/yaml",
};
const delimiterOptions: { value: DelimiterChoice; label: string }[] = [
	{ value: "auto", label: "delimiter_auto" },
	{ value: ",", label: "delimiter_comma" },
	{ value: ";", label: "delimiter_semicolon" },
	{ value: "\t", label: "delimiter_tab" },
	{ value: "|", label: "delimiter_pipe" },
];
const jsonIndents: Indent[] = ["2", "4", "tab"];
const yamlIndents: Indent[] = ["2", "4"];

/** Direction for an opened file, keeping the current one when it fits. */
function directionForFile(name: string, current: Direction): Direction {
	const extension = name.toLowerCase().split(".").pop();
	if (extension === "csv" || extension === "tsv") return "csvToJson";
	if (extension === "yaml" || extension === "yml") return "yamlToJson";
	if (extension === "json")
		return sides[current].from === "json" ? current : "jsonToCsv";
	return current;
}

export function ConvertPanel({ t }: { t: DataFormatterText }) {
	const [direction, setDirection] = useState<Direction>("csvToJson");
	const [input, setInput] = useState("");
	const [fileName, setFileName] = useState<string | null>(null);
	const [delimiter, setDelimiter] = useState<DelimiterChoice>("auto");
	const [header, setHeader] = useState(true);
	const [inferTypes, setInferTypes] = useState(true);
	const [flatten, setFlatten] = useState(true);
	const [indent, setIndent] = useState<Indent>("2");
	const [fileError, setFileError] = useState<FileError | null>(null);

	const { from, to } = sides[direction];
	const usesCsv = from === "csv" || to === "csv";
	const outputDelimiter: Delimiter = delimiter === "auto" ? "," : delimiter;
	// YAML cannot be indented with tabs.
	const yamlIndent = indent === "4" ? "4" : "2";
	const debounced = useDebouncedValue(input, 300);
	const result = useMemo((): Result | null => {
		if (debounced.trim() === "") return null;
		switch (direction) {
			case "csvToJson":
				return csvToJson(debounced, { delimiter, header, inferTypes, indent });
			case "jsonToCsv":
				return jsonToCsv(debounced, {
					delimiter: outputDelimiter,
					header,
					flatten,
				});
			case "jsonToYaml":
				return jsonToYaml(debounced, yamlIndent);
			case "yamlToJson":
				return yamlToJson(debounced, indentText(indent));
		}
	}, [
		debounced,
		direction,
		delimiter,
		outputDelimiter,
		header,
		inferTypes,
		indent,
		yamlIndent,
		flatten,
	]);
	const output = result?.ok ? result.output : "";
	const error = result && !result.ok ? result.error : null;
	const placeholders: Record<Side, string> = {
		csv: t.csvPlaceholder,
		json: t.jsonPlaceholder,
		yaml: t.yamlPlaceholder,
	};

	async function openFile(file: File) {
		const read = await readTextFile(file);
		if (!read.ok) {
			setFileError(read.error);
			return;
		}
		setFileError(null);
		setFileName(file.name);
		setDirection(directionForFile(file.name, direction));
		if (file.name.toLowerCase().endsWith(".tsv")) setDelimiter("\t");
		setInput(read.text);
	}

	return (
		<div className="grid items-start gap-6 lg:grid-cols-2">
			<section className="min-w-0 border border-ink/20 bg-white p-5">
				<div className="flex flex-wrap items-end gap-3">
					<fieldset className="flex-1">
						<legend className="tool-label mb-1.5">{t.direction}</legend>
						<div className="grid grid-cols-2 gap-2">
							{directions.map((option) => (
								<button
									key={option}
									type="button"
									aria-pressed={direction === option}
									className={`tool-button px-2 ${direction === option ? "tool-button-primary" : ""}`}
									onClick={() => setDirection(option)}
								>
									{t[`direction_${option}`]}
								</button>
							))}
						</div>
					</fieldset>
					<OpenFileButton t={t} onFile={(file) => void openFile(file)} />
				</div>
				<div className="mt-4 grid gap-3 sm:grid-cols-2">
					{usesCsv && (
						<label className="tool-label">
							{t.delimiter}
							<select
								className="tool-input"
								value={from === "csv" ? delimiter : outputDelimiter}
								onChange={(event) =>
									setDelimiter(event.target.value as DelimiterChoice)
								}
							>
								{delimiterOptions
									.filter((option) => from === "csv" || option.value !== "auto")
									.map((option) => (
										<option key={option.label} value={option.value}>
											{t[option.label as keyof DataFormatterText]}
										</option>
									))}
							</select>
						</label>
					)}
					{to !== "csv" && (
						<label className="tool-label">
							{t.indent}
							<select
								className="tool-input"
								value={to === "yaml" ? yamlIndent : indent}
								onChange={(event) => setIndent(event.target.value as Indent)}
							>
								{(to === "yaml" ? yamlIndents : jsonIndents).map((option) => (
									<option key={option} value={option}>
										{t[`indent_${option}`]}
									</option>
								))}
							</select>
						</label>
					)}
				</div>
				{usesCsv && (
					<div className="mt-3 grid gap-2 text-sm font-semibold">
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="accent-primary"
								checked={header}
								onChange={(event) => setHeader(event.target.checked)}
							/>
							{from === "csv" ? t.header : t.headerOut}
						</label>
						{from === "csv" ? (
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									className="accent-primary"
									checked={inferTypes}
									onChange={(event) => setInferTypes(event.target.checked)}
								/>
								{t.inferTypes}
							</label>
						) : (
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									className="accent-primary"
									checked={flatten}
									onChange={(event) => setFlatten(event.target.checked)}
								/>
								{t.flatten}
							</label>
						)}
					</div>
				)}
				{fileError && (
					<p role="alert" className="mt-3 text-sm text-red-700">
						{t[fileError]}
					</p>
				)}
				<h2 className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted">
					{t.input}
				</h2>
				<div className="mt-2">
					<FileDropZone label={t.input} onFile={(file) => void openFile(file)}>
						<CodeEditor
							value={input}
							onChange={setInput}
							language={languages[from]}
							label={t.input}
							placeholder={placeholders[from]}
							issues={editorIssues(error, t)}
						/>
					</FileDropZone>
				</div>
				<p className="mt-1 text-xs text-muted">{t.dropHint}</p>
				<p role="status" className="mt-3 min-h-5 text-sm text-red-700">
					{error && issueText(error, t)}
				</p>
			</section>
			<section className="min-w-0 border border-ink/20 bg-white p-5">
				<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted">
					{t.output}
				</h2>
				<div className="mt-2">
					<CodeEditor
						value={output}
						language={languages[to]}
						label={t.output}
						placeholder={t.outputPlaceholder}
						readOnly
					/>
				</div>
				{result?.ok && <IssueList issues={result.warnings} t={t} />}
				<OutputActions
					text={output}
					fileName={`${baseName(fileName)}.${to}`}
					mime={mimeTypes[to]}
					t={t}
					extra={
						<button
							type="button"
							className="tool-button"
							disabled={!output}
							onClick={() => {
								setInput(output);
								setDirection(sides[direction].reverse);
							}}
						>
							<ArrowLeftRight size={15} aria-hidden="true" />
							{t.swap}
						</button>
					}
				/>
			</section>
		</div>
	);
}
