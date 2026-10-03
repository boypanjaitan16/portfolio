import { Check, Copy, Download, FileUp, Info } from "lucide-react";
import {
	type DragEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { copyText } from "../../shared/clipboard";
import { downloadBlob } from "../../shared/download";
import type { EditorIssue } from "./CodeEditor";
import type { useDataFormatterTranslations } from "./locale";
import type { Issue } from "./result";

export type DataFormatterText = ReturnType<typeof useDataFormatterTranslations>;

export const maxFileBytes = 5 * 1024 * 1024;
export const fileAccept =
	".json,.yaml,.yml,.xml,.csv,.tsv,.txt,application/json,application/xml,text/csv,text/plain";

export function fill(
	template: string,
	values: Record<string, string | number> = {},
): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		key in values ? String(values[key]) : match,
	);
}

export function issueMessage(issue: Issue, t: DataFormatterText): string {
	return issue.code
		? fill(t[`issue_${issue.code}`], issue.params)
		: (issue.message ?? "");
}

export function issueText(issue: Issue, t: DataFormatterText): string {
	const location =
		issue.line && issue.column
			? fill(t.location, { line: issue.line, column: issue.column })
			: issue.line
				? fill(t.locationLine, { line: issue.line })
				: "";
	return location + issueMessage(issue, t);
}

export function editorIssues(
	issue: Issue | null | undefined,
	t: DataFormatterText,
): EditorIssue[] {
	return issue?.line
		? [
				{
					line: issue.line,
					column: issue.column,
					message: issueMessage(issue, t),
				},
			]
		: [];
}

export function useDebouncedValue<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const timer = window.setTimeout(() => setDebounced(value), delay);
		return () => window.clearTimeout(timer);
	}, [value, delay]);
	return debounced;
}

export type FileError = "fileTooLarge" | "fileUnreadable";

export async function readTextFile(
	file: File,
): Promise<{ ok: true; text: string } | { ok: false; error: FileError }> {
	if (file.size > maxFileBytes) return { ok: false, error: "fileTooLarge" };
	try {
		return { ok: true, text: await file.text() };
	} catch {
		return { ok: false, error: "fileUnreadable" };
	}
}

export function OpenFileButton({
	t,
	onFile,
}: {
	t: DataFormatterText;
	onFile: (file: File) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	return (
		<>
			<button
				type="button"
				className="tool-button"
				onClick={() => inputRef.current?.click()}
			>
				<FileUp size={15} aria-hidden="true" />
				{t.openFile}
			</button>
			<input
				ref={inputRef}
				type="file"
				accept={fileAccept}
				aria-label={t.openFile}
				className="sr-only"
				onChange={(event) => {
					const file = event.target.files?.[0];
					if (file) onFile(file);
					event.target.value = "";
				}}
			/>
		</>
	);
}

/** Wraps an editor so dropping a file opens it instead of inserting text. */
export function FileDropZone({
	label,
	onFile,
	children,
}: {
	label: string;
	onFile: (file: File) => void;
	children: ReactNode;
}) {
	const [active, setActive] = useState(false);
	const hasFiles = (event: DragEvent) =>
		[...event.dataTransfer.types].includes("Files");
	return (
		<fieldset
			className={`min-w-0 ${active ? "outline outline-2 outline-primary" : ""}`}
			onDragOverCapture={(event) => {
				if (!hasFiles(event)) return;
				event.preventDefault();
				setActive(true);
			}}
			onDragLeave={() => setActive(false)}
			onDropCapture={(event) => {
				const file = event.dataTransfer.files[0];
				setActive(false);
				if (!file) return;
				event.preventDefault();
				event.stopPropagation();
				onFile(file);
			}}
		>
			<legend className="sr-only">{label}</legend>
			{children}
		</fieldset>
	);
}

export function IssueList({
	issues,
	t,
}: {
	issues: Issue[];
	t: DataFormatterText;
}) {
	if (issues.length === 0) return null;
	return (
		<div className="mt-3 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
			<p className="flex items-center gap-2 font-semibold">
				<Info size={15} aria-hidden="true" />
				{t.warnings}
			</p>
			<ul className="mt-2 grid list-disc gap-1 pl-5">
				{issues.map((issue, index) => (
					// Issues have no stable id and never reorder within one result.
					<li key={index}>{issueText(issue, t)}</li>
				))}
			</ul>
		</div>
	);
}

export function OutputActions({
	text,
	fileName,
	mime,
	t,
	extra,
}: {
	text: string;
	fileName: string;
	mime: string;
	t: DataFormatterText;
	extra?: ReactNode;
}) {
	// The status belongs to the text that was copied, so new output clears it.
	const [copied, setCopied] = useState<{
		text: string;
		ok: boolean;
	} | null>(null);
	const copyStatus =
		copied?.text === text ? (copied.ok ? "copied" : "failed") : null;

	return (
		<div className="mt-3 flex flex-wrap items-center gap-2">
			<button
				type="button"
				className="tool-button"
				disabled={!text}
				onClick={async () => {
					try {
						await copyText(text);
						setCopied({ text, ok: true });
					} catch {
						setCopied({ text, ok: false });
					}
				}}
			>
				<Copy size={15} aria-hidden="true" />
				{t.copy}
			</button>
			<button
				type="button"
				className="tool-button"
				disabled={!text}
				onClick={() =>
					downloadBlob(
						new Blob([text], { type: `${mime};charset=utf-8` }),
						fileName,
					)
				}
			>
				<Download size={15} aria-hidden="true" />
				{t.download}
			</button>
			{extra}
			<p role="status" className="min-h-5 text-sm text-primary">
				{copyStatus === "copied" && (
					<>
						<Check size={15} className="mr-1 inline" aria-hidden="true" />
						{t.copied}
					</>
				)}
				{copyStatus === "failed" && (
					<span className="text-red-700">{t.copyFailed}</span>
				)}
			</p>
		</div>
	);
}

export function baseName(fileName: string | null): string {
	return fileName?.replace(/\.[^./\\]+$/, "").trim() || "data";
}
