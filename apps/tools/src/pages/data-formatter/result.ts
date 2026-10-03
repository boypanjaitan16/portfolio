/** Problems this tool detects itself, so their messages can be localized. */
export type IssueCode =
	| "jsonUnexpectedEnd"
	| "jsonUnexpectedChar"
	| "jsonInvalidNumber"
	| "jsonInvalidString"
	| "jsonInvalidEscape"
	| "jsonTooDeep"
	| "jsonDuplicateKey"
	| "precisionLoss"
	| "multiDocument"
	| "csvUnclosedQuote"
	| "csvUnexpectedQuote"
	| "csvRaggedRow"
	| "csvShape";

export type Issue = {
	/** Missing for messages that come from a library or the browser. */
	code?: IssueCode;
	/** Library or browser text, shown as-is when there is no code. */
	message?: string;
	params?: Record<string, string | number>;
	line?: number;
	column?: number;
};

export type Result =
	| { ok: true; output: string; warnings: Issue[] }
	| { ok: false; error: Issue };

export function success(output: string, warnings: Issue[] = []): Result {
	return { ok: true, output, warnings };
}

export function failure(error: Issue): Result {
	return { ok: false, error };
}

/** 1-based line and column for a string offset. */
export function lineColumn(
	text: string,
	offset: number,
): { line: number; column: number } {
	let line = 1;
	let lineStart = 0;
	const end = Math.min(offset, text.length);
	for (let index = 0; index < end; index += 1) {
		if (text[index] === "\n") {
			line += 1;
			lineStart = index + 1;
		}
	}
	return { line, column: end - lineStart + 1 };
}

export type Indent = "2" | "4" | "tab";

export function indentText(indent: Indent): string {
	return indent === "tab" ? "\t" : " ".repeat(Number(indent));
}
