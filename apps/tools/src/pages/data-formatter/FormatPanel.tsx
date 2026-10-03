import { CheckCircle2, CircleAlert, CornerUpLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { type DataFormat, detectFormat } from "./detectFormat";
import {
	formatJson,
	minifyJson,
	sortJsonKeys,
	validateJson,
} from "./jsonFormat";
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
import type { Indent, Issue, Result } from "./result";
import { formatXml, minifyXml, validateXml } from "./xmlFormat";
import { formatYaml, validateYaml, type YamlIndent } from "./yamlFormat";

type FormatChoice = "auto" | DataFormat;
type Action = "format" | "minify" | "sortKeys";
type Output = { text: string; format: DataFormat; warnings: Issue[] };

const formats: DataFormat[] = ["json", "yaml", "xml"];
const indents: Indent[] = ["2", "4", "tab"];
const formatNames: Record<DataFormat, string> = {
	json: "JSON",
	yaml: "YAML",
	xml: "XML",
};
const mimeTypes: Record<DataFormat, string> = {
	json: "application/json",
	yaml: "application/yaml",
	xml: "application/xml",
};
const extensions: Record<DataFormat, string> = {
	json: "json",
	yaml: "yaml",
	xml: "xml",
};

function validate(format: DataFormat, text: string): Result {
	if (format === "json") return validateJson(text);
	if (format === "yaml") return validateYaml(text);
	return validateXml(text);
}

function yamlIndent(indent: Indent): YamlIndent {
	return indent === "4" ? "4" : "2";
}

const actionsFor: Record<DataFormat, Action[]> = {
	json: ["format", "minify", "sortKeys"],
	yaml: ["format"],
	xml: ["format", "minify"],
};

function runAction(
	action: Action,
	format: DataFormat,
	text: string,
	indent: Indent,
): Result {
	switch (action) {
		case "format":
			return format === "json"
				? formatJson(text, indent)
				: format === "yaml"
					? formatYaml(text, yamlIndent(indent))
					: formatXml(text, indent);
		case "minify":
			return format === "json" ? minifyJson(text) : minifyXml(text);
		case "sortKeys":
			return sortJsonKeys(text, indent);
	}
}

export function FormatPanel({ t }: { t: DataFormatterText }) {
	const [input, setInput] = useState("");
	const [fileName, setFileName] = useState<string | null>(null);
	const [choice, setChoice] = useState<FormatChoice>("auto");
	const [indent, setIndent] = useState<Indent>("2");
	const [output, setOutput] = useState<Output | null>(null);
	const [actionError, setActionError] = useState<Issue | null>(null);
	const [fileError, setFileError] = useState<FileError | null>(null);

	const detected = detectFormat(input, fileName ?? undefined);
	const format = choice === "auto" ? detected : choice;
	const debounced = useDebouncedValue(input, 300);
	const checking = debounced !== input;
	const validation = useMemo(
		() => (debounced.trim() === "" ? null : validate(format, debounced)),
		[debounced, format],
	);
	const error =
		actionError ?? (validation && !validation.ok ? validation.error : null);

	function changeInput(text: string) {
		setInput(text);
		setActionError(null);
	}

	async function openFile(file: File) {
		const read = await readTextFile(file);
		if (!read.ok) {
			setFileError(read.error);
			return;
		}
		setFileError(null);
		setFileName(file.name);
		setChoice("auto");
		changeInput(read.text);
		setOutput(null);
	}

	function apply(action: Action) {
		const result = runAction(action, format, input, indent);
		if (result.ok) {
			setActionError(null);
			setOutput({
				text: result.output,
				format,
				warnings: result.warnings,
			});
		} else {
			setActionError(result.error);
			setOutput(null);
		}
	}

	const actionLabels: Record<Action, string> = {
		format: t.actionFormat,
		minify: t.actionMinify,
		sortKeys: t.actionSortKeys,
	};

	return (
		<div className="grid items-start gap-6 lg:grid-cols-2">
			<section className="min-w-0 border border-ink/20 bg-white p-5">
				<div className="flex flex-wrap items-end gap-3">
					<label className="tool-label min-w-40 flex-1">
						{t.format}
						<select
							className="tool-input"
							value={choice}
							onChange={(event) => {
								setChoice(event.target.value as FormatChoice);
								setActionError(null);
							}}
						>
							<option value="auto">
								{t.format_auto.replace("{detected}", formatNames[detected])}
							</option>
							{formats.map((option) => (
								<option key={option} value={option}>
									{formatNames[option]}
								</option>
							))}
						</select>
					</label>
					<label className="tool-label min-w-32 flex-1">
						{t.indent}
						<select
							className="tool-input"
							value={indent}
							onChange={(event) => setIndent(event.target.value as Indent)}
						>
							{indents.map((option) => (
								<option key={option} value={option}>
									{t[`indent_${option}`]}
								</option>
							))}
						</select>
					</label>
					<OpenFileButton t={t} onFile={(file) => void openFile(file)} />
				</div>
				{format === "yaml" && indent === "tab" && (
					<p className="mt-2 text-xs text-muted">{t.yamlTabNote}</p>
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
							onChange={changeInput}
							language={format}
							label={t.input}
							placeholder={t.inputPlaceholder}
							issues={editorIssues(checking ? actionError : error, t)}
						/>
					</FileDropZone>
				</div>
				<p className="mt-1 text-xs text-muted">{t.dropHint}</p>
				<p
					role="status"
					className={`mt-3 flex min-h-5 items-start gap-2 text-sm ${error ? "text-red-700" : "text-primary"}`}
				>
					{input.trim() === "" ? (
						<span className="text-muted">{t.statusEmpty}</span>
					) : checking && !actionError ? (
						<span className="text-muted">{t.statusChecking}</span>
					) : error ? (
						<>
							<CircleAlert
								size={16}
								className="mt-0.5 shrink-0"
								aria-hidden="true"
							/>
							<span>
								{t.statusInvalid.replace("{format}", formatNames[format])}{" "}
								{issueText(error, t)}
							</span>
						</>
					) : (
						<>
							<CheckCircle2
								size={16}
								className="mt-0.5 shrink-0"
								aria-hidden="true"
							/>
							{t.statusValid.replace("{format}", formatNames[format])}
						</>
					)}
				</p>
				{validation?.ok && !checking && (
					<IssueList issues={validation.warnings} t={t} />
				)}
				<div className="mt-4 flex flex-wrap gap-2">
					{actionsFor[format].map((action, index) => (
						<button
							key={action}
							type="button"
							className={`tool-button ${index === 0 ? "tool-button-primary" : ""}`}
							disabled={input.trim() === ""}
							onClick={() => apply(action)}
						>
							{actionLabels[action]}
						</button>
					))}
				</div>
			</section>
			<section className="min-w-0 border border-ink/20 bg-white p-5">
				<h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted">
					{t.output}
				</h2>
				<div className="mt-2">
					<CodeEditor
						value={output?.text ?? ""}
						language={output?.format ?? format}
						label={t.output}
						placeholder={t.outputPlaceholder}
						readOnly
					/>
				</div>
				{output && <IssueList issues={output.warnings} t={t} />}
				<OutputActions
					text={output?.text ?? ""}
					fileName={`${baseName(fileName)}.${extensions[output?.format ?? format]}`}
					mime={mimeTypes[output?.format ?? format]}
					t={t}
					extra={
						<button
							type="button"
							className="tool-button"
							disabled={!output}
							onClick={() => {
								if (!output) return;
								changeInput(output.text);
								setChoice(output.format);
								setOutput(null);
							}}
						>
							<CornerUpLeft size={15} aria-hidden="true" />
							{t.useAsInput}
						</button>
					}
				/>
			</section>
		</div>
	);
}
