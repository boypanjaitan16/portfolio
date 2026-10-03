import type { Issue } from "./result";

export type Delimiter = "," | ";" | "\t" | "|";

export const delimiters: readonly Delimiter[] = [",", ";", "\t", "|"];

export type CsvRow = { fields: string[]; line: number };

export type CsvParse =
	| { ok: true; rows: CsvRow[] }
	| { ok: false; error: Issue };

/**
 * RFC 4180 parser. A field is quoted only when it starts with `"`; quotes
 * inside unquoted fields are kept as text. Fully empty lines are skipped.
 */
export function parseCsv(input: string, delimiter: Delimiter): CsvParse {
	const text = input.startsWith("﻿") ? input.slice(1) : input;
	const rows: CsvRow[] = [];
	let fields: string[] = [];
	let field = "";
	let line = 1;
	let rowLine = 1;
	let index = 0;
	let quoted = false;
	let quoteLine = 1;
	let quoteColumn = 1;
	let lineStart = 0;

	const endRow = () => {
		fields.push(field);
		if (!(fields.length === 1 && fields[0] === ""))
			rows.push({ fields, line: rowLine });
		fields = [];
		field = "";
	};

	while (index < text.length) {
		const char = text[index];
		if (quoted) {
			if (char === '"') {
				if (text[index + 1] === '"') {
					field += '"';
					index += 2;
					continue;
				}
				quoted = false;
				index += 1;
				const next = text[index];
				if (
					next !== undefined &&
					next !== delimiter &&
					next !== "\n" &&
					next !== "\r"
				)
					return {
						ok: false,
						error: {
							code: "csvUnexpectedQuote",
							line,
							column: index - lineStart,
						},
					};
				continue;
			}
			if (char === "\n") {
				line += 1;
				lineStart = index + 1;
			}
			field += char;
			index += 1;
			continue;
		}
		if (char === '"' && field === "") {
			quoted = true;
			quoteLine = line;
			quoteColumn = index - lineStart + 1;
			index += 1;
		} else if (char === delimiter) {
			fields.push(field);
			field = "";
			index += 1;
		} else if (char === "\r" || char === "\n") {
			endRow();
			index += char === "\r" && text[index + 1] === "\n" ? 2 : 1;
			line += 1;
			lineStart = index;
			rowLine = line;
		} else {
			field += char;
			index += 1;
		}
	}
	if (quoted)
		return {
			ok: false,
			error: { code: "csvUnclosedQuote", line: quoteLine, column: quoteColumn },
		};
	if (field !== "" || fields.length > 0) endRow();
	return { ok: true, rows };
}

/** Picks the candidate that splits the first lines most consistently. */
export function detectDelimiter(text: string): Delimiter {
	const sample = text
		.replace(/^﻿/, "")
		.split(/\r?\n/)
		.filter((line) => line.trim() !== "")
		.slice(0, 10)
		.map((line) => line.replace(/"(?:[^"]|"")*"/g, ""));
	let best: Delimiter = ",";
	let bestScore = 0;
	for (const delimiter of delimiters) {
		const counts = sample.map((line) => line.split(delimiter).length - 1);
		const first = counts[0] ?? 0;
		if (first === 0) continue;
		const consistent = counts.filter((count) => count === first).length;
		const score = consistent * 1000 + first;
		if (score > bestScore) {
			best = delimiter;
			bestScore = score;
		}
	}
	return best;
}

function quoteField(value: string, delimiter: Delimiter): string {
	return value.includes(delimiter) ||
		/["\r\n]/.test(value) ||
		value !== value.trim()
		? `"${value.replaceAll('"', '""')}"`
		: value;
}

export function stringifyCsv(rows: string[][], delimiter: Delimiter): string {
	return rows
		.map((row) =>
			row.map((value) => quoteField(value, delimiter)).join(delimiter),
		)
		.join("\n");
}
