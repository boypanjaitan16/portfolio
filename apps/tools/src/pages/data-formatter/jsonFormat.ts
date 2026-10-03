import {
	failure,
	type Indent,
	type Issue,
	type IssueCode,
	indentText,
	lineColumn,
	type Result,
	success,
} from "./result";

/** Punctuation is kept as its character; literals keep their exact source. */
type Token =
	| { type: "{" | "}" | "[" | "]" | ":" | "," }
	| { type: "literal"; raw: string };

type Scan =
	| { ok: true; tokens: Token[]; warnings: Issue[]; unsafeNumbers: boolean }
	| { ok: false; error: Issue };

const maxDepth = 512;
const numberPattern = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const escapes = new Set(['"', "\\", "/", "b", "f", "n", "r", "t"]);

class JsonSyntaxError extends Error {
	readonly code: IssueCode;
	readonly offset: number;
	readonly params?: Record<string, string>;

	constructor(
		code: IssueCode,
		offset: number,
		params?: Record<string, string>,
	) {
		super(code);
		this.code = code;
		this.offset = offset;
		this.params = params;
	}
}

function significantDigits(number: string): string {
	return number
		.replace(/^-/, "")
		.replace(/[eE].*$/, "")
		.replace(".", "")
		.replace(/^0+/, "")
		.replace(/0+$/, "");
}

/**
 * True when JSON.parse would change this number literal's value: rounding
 * large integers or long decimals, or overflowing to Infinity or 0.
 */
export function isUnsafeNumber(raw: string): boolean {
	const value = Number(raw);
	if (!Number.isFinite(value)) return true;
	return significantDigits(raw) !== significantDigits(value.toExponential());
}

/**
 * Strict JSON scanner (RFC 8259). It reports the first error with an exact
 * offset and keeps every literal's source text, so formatting never changes
 * numbers, escapes, key order, or duplicate keys.
 */
export function scanJson(text: string): Scan {
	const tokens: Token[] = [];
	const warnings: Issue[] = [];
	let unsafeNumbers = false;
	let index = 0;

	function skipWhitespace() {
		while (index < text.length) {
			const char = text[index];
			if (char !== " " && char !== "\t" && char !== "\n" && char !== "\r")
				break;
			index += 1;
		}
	}

	function unexpected(): never {
		if (index >= text.length)
			throw new JsonSyntaxError("jsonUnexpectedEnd", text.length);
		throw new JsonSyntaxError("jsonUnexpectedChar", index, {
			char: JSON.stringify(text[index]),
		});
	}

	function readString(): string {
		const start = index;
		index += 1;
		while (index < text.length) {
			const char = text[index];
			if (char === '"') {
				index += 1;
				const raw = text.slice(start, index);
				tokens.push({ type: "literal", raw });
				return raw;
			}
			if (char === "\\") {
				const next = text[index + 1];
				if (next === "u") {
					if (!/^[0-9a-fA-F]{4}$/.test(text.slice(index + 2, index + 6)))
						throw new JsonSyntaxError("jsonInvalidEscape", index);
					index += 6;
				} else if (next !== undefined && escapes.has(next)) index += 2;
				else if (next === undefined) break;
				else throw new JsonSyntaxError("jsonInvalidEscape", index);
				continue;
			}
			if (char.charCodeAt(0) < 0x20)
				throw new JsonSyntaxError("jsonInvalidString", index);
			index += 1;
		}
		throw new JsonSyntaxError("jsonUnexpectedEnd", text.length);
	}

	function readValue(depth: number) {
		if (depth > maxDepth) throw new JsonSyntaxError("jsonTooDeep", index);
		skipWhitespace();
		const char = text[index];
		if (char === "{") {
			tokens.push({ type: "{" });
			index += 1;
			skipWhitespace();
			if (text[index] === "}") {
				tokens.push({ type: "}" });
				index += 1;
				return;
			}
			const keys = new Set<string>();
			for (;;) {
				skipWhitespace();
				if (text[index] !== '"') unexpected();
				const keyOffset = index;
				const key = readString();
				if (keys.has(key)) {
					warnings.push({
						code: "jsonDuplicateKey",
						params: { key },
						...lineColumn(text, keyOffset),
					});
				}
				keys.add(key);
				skipWhitespace();
				if (text[index] !== ":") unexpected();
				tokens.push({ type: ":" });
				index += 1;
				readValue(depth + 1);
				skipWhitespace();
				if (text[index] === ",") {
					tokens.push({ type: "," });
					index += 1;
				} else if (text[index] === "}") {
					tokens.push({ type: "}" });
					index += 1;
					return;
				} else unexpected();
			}
		}
		if (char === "[") {
			tokens.push({ type: "[" });
			index += 1;
			skipWhitespace();
			if (text[index] === "]") {
				tokens.push({ type: "]" });
				index += 1;
				return;
			}
			for (;;) {
				readValue(depth + 1);
				skipWhitespace();
				if (text[index] === ",") {
					tokens.push({ type: "," });
					index += 1;
				} else if (text[index] === "]") {
					tokens.push({ type: "]" });
					index += 1;
					return;
				} else unexpected();
			}
		}
		if (char === '"') {
			readString();
			return;
		}
		if (char === "-" || (char >= "0" && char <= "9")) {
			numberPattern.lastIndex = index;
			const match = numberPattern.exec(text);
			const end = match ? index + match[0].length : index;
			if (!match || /[0-9.eE+-]/.test(text[end] ?? ""))
				throw new JsonSyntaxError("jsonInvalidNumber", index);
			tokens.push({ type: "literal", raw: match[0] });
			if (isUnsafeNumber(match[0])) unsafeNumbers = true;
			index = end;
			return;
		}
		for (const word of ["true", "false", "null"]) {
			if (text.startsWith(word, index)) {
				tokens.push({ type: "literal", raw: word });
				index += word.length;
				return;
			}
		}
		unexpected();
	}

	try {
		readValue(0);
		skipWhitespace();
		if (index < text.length) unexpected();
		return { ok: true, tokens, warnings, unsafeNumbers };
	} catch (error) {
		if (!(error instanceof JsonSyntaxError)) throw error;
		return {
			ok: false,
			error: {
				code: error.code,
				params: error.params,
				...lineColumn(text, error.offset),
			},
		};
	}
}

function print(tokens: Token[], indent: string | null): string {
	const pretty = indent !== null;
	let output = "";
	let depth = 0;
	const newline = () => `\n${(indent ?? "").repeat(depth)}`;
	for (let index = 0; index < tokens.length; index += 1) {
		const token = tokens[index];
		switch (token.type) {
			case "{":
			case "[": {
				const close = token.type === "{" ? "}" : "]";
				if (tokens[index + 1]?.type === close) {
					output += token.type + close;
					index += 1;
				} else {
					depth += 1;
					output += pretty ? token.type + newline() : token.type;
				}
				break;
			}
			case "}":
			case "]":
				depth -= 1;
				output += pretty ? newline() + token.type : token.type;
				break;
			case ",":
				output += pretty ? `,${newline()}` : ",";
				break;
			case ":":
				output += pretty ? ": " : ":";
				break;
			default:
				output += token.raw;
		}
	}
	return output;
}

export function validateJson(text: string): Result {
	const scan = scanJson(text);
	return scan.ok ? success(text, scan.warnings) : failure(scan.error);
}

export function formatJson(text: string, indent: Indent): Result {
	const scan = scanJson(text);
	if (!scan.ok) return failure(scan.error);
	return success(print(scan.tokens, indentText(indent)), scan.warnings);
}

export function minifyJson(text: string): Result {
	const scan = scanJson(text);
	if (!scan.ok) return failure(scan.error);
	return success(print(scan.tokens, null), scan.warnings);
}

function sortValue(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(sortValue);
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.keys(value)
				.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
				.map((key) => [
					key,
					sortValue((value as Record<string, unknown>)[key]),
				]),
		);
	}
	return value;
}

/**
 * Parses valid JSON into a value for operations that need one. Warnings note
 * when parsing loses detail: rounded numbers or collapsed duplicate keys.
 */
export function parseJsonValue(
	text: string,
):
	| { ok: true; value: unknown; warnings: Issue[] }
	| { ok: false; error: Issue } {
	const scan = scanJson(text);
	if (!scan.ok) return scan;
	const warnings: Issue[] = [...scan.warnings];
	if (scan.unsafeNumbers) warnings.push({ code: "precisionLoss" });
	return { ok: true, value: JSON.parse(text), warnings };
}

export function sortJsonKeys(text: string, indent: Indent): Result {
	const parsed = parseJsonValue(text);
	if (!parsed.ok) return failure(parsed.error);
	return success(
		JSON.stringify(sortValue(parsed.value), null, indentText(indent)),
		parsed.warnings,
	);
}
