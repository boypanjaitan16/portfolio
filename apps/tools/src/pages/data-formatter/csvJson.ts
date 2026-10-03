import { type Delimiter, detectDelimiter, parseCsv, stringifyCsv } from "./csv";
import { parseJsonValue } from "./jsonFormat";
import {
	failure,
	type Indent,
	type Issue,
	indentText,
	type Result,
	success,
} from "./result";

export type DelimiterChoice = Delimiter | "auto";

export type CsvToJsonOptions = {
	delimiter: DelimiterChoice;
	header: boolean;
	inferTypes: boolean;
	indent: Indent;
};

export type JsonToCsvOptions = {
	delimiter: Delimiter;
	header: boolean;
	flatten: boolean;
};

const numberPattern = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

/** Converts obvious numbers, booleans, and null; anything ambiguous stays text. */
export function inferValue(value: string): unknown {
	if (value === "true") return true;
	if (value === "false") return false;
	if (value === "null") return null;
	if (numberPattern.test(value)) {
		const number = Number(value);
		const integer = /^-?\d+$/.test(value);
		if (Number.isFinite(number) && (!integer || Number.isSafeInteger(number)))
			return number;
	}
	return value;
}

/** Blank headers become `column_N`; repeats become `name_2`, `name_3`. */
export function uniqueHeaders(fields: string[]): string[] {
	const used = new Set<string>();
	return fields.map((field, index) => {
		const base = field.trim() === "" ? `column_${index + 1}` : field;
		let name = base;
		for (let count = 2; used.has(name); count += 1) name = `${base}_${count}`;
		used.add(name);
		return name;
	});
}

export function csvToJson(text: string, options: CsvToJsonOptions): Result {
	const delimiter =
		options.delimiter === "auto" ? detectDelimiter(text) : options.delimiter;
	const parsed = parseCsv(text, delimiter);
	if (!parsed.ok) return failure(parsed.error);
	const convert = (value: string) =>
		options.inferTypes ? inferValue(value) : value;
	const warnings: Issue[] = [];
	const [first, ...rest] = parsed.rows;
	let data: unknown[];
	if (!first) data = [];
	else if (options.header) {
		const headers = uniqueHeaders(first.fields);
		data = rest.map((row) => {
			if (row.fields.length !== headers.length)
				warnings.push({
					code: "csvRaggedRow",
					line: row.line,
					params: { expected: headers.length, actual: row.fields.length },
				});
			const names = uniqueHeaders([
				...headers,
				...row.fields.slice(headers.length).map(() => ""),
			]);
			return Object.fromEntries(
				names.map((name, index) => [name, convert(row.fields[index] ?? "")]),
			);
		});
	} else {
		data = parsed.rows.map((row) => row.fields.map(convert));
	}
	return success(JSON.stringify(data, null, indentText(options.indent)), [
		...warnings.slice(0, 20),
	]);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cellText(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "string") return value;
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

/** `{ a: { b: 1 }, c: [2] }` becomes `{ "a.b": 1, "c.0": 2 }`. */
function flattenValue(
	value: unknown,
	prefix: string,
	out: Record<string, unknown>,
) {
	const entries = Array.isArray(value)
		? value.map((item, index) => [String(index), item] as const)
		: isPlainObject(value)
			? Object.entries(value)
			: null;
	if (!entries || entries.length === 0) {
		out[prefix] = value;
		return;
	}
	for (const [key, item] of entries)
		flattenValue(item, prefix ? `${prefix}.${key}` : key, out);
}

export function jsonToCsv(text: string, options: JsonToCsvOptions): Result {
	const parsed = parseJsonValue(text);
	if (!parsed.ok) return failure(parsed.error);
	const value = parsed.value;
	const items = Array.isArray(value)
		? value
		: isPlainObject(value)
			? [value]
			: null;
	if (!items) return failure({ code: "csvShape" });
	if (items.length === 0) return success("", parsed.warnings);

	if (items.every(Array.isArray)) {
		return success(
			stringifyCsv(
				(items as unknown[][]).map((row) => row.map(cellText)),
				options.delimiter,
			),
			parsed.warnings,
		);
	}
	if (items.every((item) => !isPlainObject(item) && !Array.isArray(item))) {
		const rows = items.map((item) => [cellText(item)]);
		return success(
			stringifyCsv(
				options.header ? [["value"], ...rows] : rows,
				options.delimiter,
			),
			parsed.warnings,
		);
	}
	if (!items.every(isPlainObject)) return failure({ code: "csvShape" });

	const records = items.map((item) => {
		if (!options.flatten) return item;
		const flat: Record<string, unknown> = {};
		flattenValue(item, "", flat);
		return flat;
	});
	const columns: string[] = [];
	const seen = new Set<string>();
	for (const record of records)
		for (const key of Object.keys(record))
			if (!seen.has(key)) {
				seen.add(key);
				columns.push(key);
			}
	const rows = records.map((record) =>
		columns.map((column) => cellText(record[column])),
	);
	return success(
		stringifyCsv(options.header ? [columns, ...rows] : rows, options.delimiter),
		parsed.warnings,
	);
}
