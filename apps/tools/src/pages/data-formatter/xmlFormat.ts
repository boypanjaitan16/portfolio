import {
	failure,
	type Indent,
	type Issue,
	indentText,
	type Result,
	success,
} from "./result";

/** Reads the browser's parser error text, whose shape differs by engine. */
export function parserErrorIssue(text: string): Issue {
	const clean = text.replace(/\s+$/, "");
	// Chrome and Safari: "error on line 3 at column 5: message".
	const webkit = /error on line (\d+) at column (\d+):\s*([^\n]*)/i.exec(clean);
	if (webkit)
		return {
			message: webkit[3].trim(),
			line: Number(webkit[1]),
			column: Number(webkit[2]),
		};
	// Firefox: "XML Parsing Error: message\nLocation: …\nLine Number 3, Column 5:".
	const gecko = /Line Number (\d+), Column (\d+)/i.exec(clean);
	if (gecko) {
		const message = /XML Parsing Error:\s*([^\n]*)/i.exec(clean);
		return {
			message: (message?.[1] ?? clean.split("\n")[0]).trim(),
			line: Number(gecko[1]),
			column: Number(gecko[2]),
		};
	}
	// jsdom and similar: "3:5: message".
	const compact = /^(\d+):(\d+):\s*(.*)$/m.exec(clean);
	if (compact)
		return {
			message: compact[3].trim(),
			line: Number(compact[1]),
			column: Math.max(1, Number(compact[2])),
		};
	return { message: clean.slice(0, 300) };
}

export function validateXml(text: string): Result {
	const document = new DOMParser().parseFromString(text, "application/xml");
	const error = document.getElementsByTagName("parsererror")[0];
	return error
		? failure(parserErrorIssue(error.textContent ?? ""))
		: success(text);
}

type XmlNode =
	| {
			type: "element";
			name: string;
			open: string;
			close: string;
			selfClosing: boolean;
			children: XmlNode[];
			start: number;
			end: number;
	  }
	| { type: "text"; raw: string }
	| { type: "markup"; raw: string };

/** Index just after the end of a tag, skipping `>` inside quoted values. */
function tagEnd(text: string, from: number): number {
	let quote: string | null = null;
	for (let index = from; index < text.length; index += 1) {
		const char = text[index];
		if (quote) {
			if (char === quote) quote = null;
		} else if (char === '"' || char === "'") quote = char;
		else if (char === ">") return index + 1;
	}
	return text.length;
}

function doctypeEnd(text: string, from: number): number {
	let depth = 0;
	let quote: string | null = null;
	for (let index = from; index < text.length; index += 1) {
		const char = text[index];
		if (quote) {
			if (char === quote) quote = null;
		} else if (char === '"' || char === "'") quote = char;
		else if (char === "[") depth += 1;
		else if (char === "]") depth -= 1;
		else if (char === ">" && depth <= 0) return index + 1;
	}
	return text.length;
}

function until(text: string, from: number, marker: string): number {
	const index = text.indexOf(marker, from);
	return index === -1 ? text.length : index + marker.length;
}

/** Builds a lightweight tree; only called on input the browser accepted. */
function parseTree(text: string): XmlNode[] {
	const root: XmlNode[] = [];
	const stack: Extract<XmlNode, { type: "element" }>[] = [];
	const add = (node: XmlNode) => (stack.at(-1)?.children ?? root).push(node);
	let index = 0;
	while (index < text.length) {
		if (text[index] !== "<") {
			const next = text.indexOf("<", index);
			const end = next === -1 ? text.length : next;
			add({ type: "text", raw: text.slice(index, end) });
			index = end;
			continue;
		}
		let end: number;
		if (text.startsWith("<!--", index)) end = until(text, index + 4, "-->");
		else if (text.startsWith("<![CDATA[", index)) {
			end = until(text, index + 9, "]]>");
			add({ type: "text", raw: text.slice(index, end) });
			index = end;
			continue;
		} else if (text.startsWith("<?", index)) end = until(text, index + 2, "?>");
		else if (text.startsWith("<!", index)) end = doctypeEnd(text, index + 2);
		else if (text.startsWith("</", index)) {
			end = tagEnd(text, index + 2);
			const element = stack.pop();
			if (element) {
				element.close = text.slice(index, end);
				element.end = end;
			}
			index = end;
			continue;
		} else {
			end = tagEnd(text, index + 1);
			const open = text.slice(index, end);
			const name = /^<([^\s/>]+)/.exec(open)?.[1] ?? "";
			const selfClosing = /\/\s*>$/.test(open);
			const element: XmlNode = {
				type: "element",
				name,
				open,
				close: "",
				selfClosing,
				children: [],
				start: index,
				end,
			};
			add(element);
			if (!selfClosing) stack.push(element);
			index = end;
			continue;
		}
		add({ type: "markup", raw: text.slice(index, end) });
		index = end;
	}
	return root;
}

function isBlank(node: XmlNode): boolean {
	return node.type === "text" && node.raw.trim() === "";
}

/**
 * Elements whose content must stay exactly as written: mixed content (text
 * next to child elements) and `xml:space="preserve"`.
 */
function keepVerbatim(node: Extract<XmlNode, { type: "element" }>): boolean {
	if (/\sxml:space\s*=\s*["']preserve["']/.test(node.open)) return true;
	const hasElement = node.children.some((child) => child.type !== "text");
	const hasText = node.children.some(
		(child) => child.type === "text" && !isBlank(child),
	);
	return hasElement && hasText;
}

function serialize(
	nodes: XmlNode[],
	source: string,
	indent: string | null,
	depth: number,
): string[] {
	const lines: string[] = [];
	const pad = (indent ?? "").repeat(depth);
	for (const node of nodes) {
		if (isBlank(node)) continue;
		if (node.type !== "element") {
			lines.push(pad + (indent === null ? node.raw : node.raw.trim()));
			continue;
		}
		if (node.selfClosing) {
			lines.push(pad + node.open);
		} else if (keepVerbatim(node)) {
			lines.push(pad + source.slice(node.start, node.end));
		} else if (node.children.every((child) => child.type === "text")) {
			// Text-only content is data; keep it exactly, including spaces.
			const content = node.children.every(isBlank)
				? ""
				: node.children.map((child) => (child as { raw: string }).raw).join("");
			lines.push(pad + node.open + content + node.close);
		} else {
			lines.push(pad + node.open);
			lines.push(...serialize(node.children, source, indent, depth + 1));
			lines.push(pad + node.close);
		}
	}
	return lines;
}

export function formatXml(text: string, indent: Indent): Result {
	const valid = validateXml(text);
	if (!valid.ok) return valid;
	return success(
		serialize(parseTree(text), text, indentText(indent), 0).join("\n"),
	);
}

/** Removes whitespace between tags; text content and comments are kept. */
export function minifyXml(text: string): Result {
	const valid = validateXml(text);
	if (!valid.ok) return valid;
	return success(serialize(parseTree(text), text, null, 0).join(""));
}
