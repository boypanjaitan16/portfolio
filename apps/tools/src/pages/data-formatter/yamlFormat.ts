import {
	Document,
	parseAllDocuments,
	type Tags,
	visit,
	type YAMLError,
} from "yaml";
import { isUnsafeNumber, parseJsonValue } from "./jsonFormat";
import { failure, type Issue, type Result, success } from "./result";

export type YamlIndent = "2" | "4";

const decimalPattern = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/;

/**
 * Number, boolean, and null scalars are written back from their source text
 * so formatting never rewrites `0x1F`, `1e3`, `~`, or very large numbers.
 */
function keepScalarSource(tags: Tags): Tags {
	return tags.map((tag) => {
		if (
			typeof tag !== "object" ||
			!("stringify" in tag) ||
			typeof tag.stringify !== "function" ||
			tag.tag === "tag:yaml.org,2002:str" ||
			("collection" in tag && tag.collection)
		)
			return tag;
		const stringify = tag.stringify;
		return {
			...tag,
			stringify: (item, ...rest) =>
				typeof item.source === "string"
					? item.source
					: stringify.call(tag, item, ...rest),
		} as typeof tag;
	});
}

function issue(error: YAMLError): Issue {
	const position = error.linePos?.[0];
	return {
		message: error.message.split(" at line ")[0].trim(),
		line: position?.line,
		column: position?.col,
	};
}

function parse(text: string) {
	const documents = parseAllDocuments(text, {
		prettyErrors: true,
		customTags: keepScalarSource,
	});
	// A stream with only a stray document end marker returns an empty array.
	const list = Array.isArray(documents) ? documents : [];
	const error = list.flatMap((document) => document.errors)[0];
	const warnings = list.flatMap((document) => document.warnings).map(issue);
	return { documents: list, error, warnings };
}

export function validateYaml(text: string): Result {
	const { error, warnings } = parse(text);
	return error ? failure(issue(error)) : success(text, warnings);
}

/** Re-indents every document. Comments and scalar spelling are kept. */
export function formatYaml(text: string, indent: YamlIndent): Result {
	const { documents, error, warnings } = parse(text);
	if (error) return failure(issue(error));
	return success(
		documents
			.map((document) => document.toString({ indent: Number(indent) }))
			.join(""),
		warnings,
	);
}

export function yamlToJson(text: string, indent: string): Result {
	const { documents, error, warnings } = parse(text);
	if (error) return failure(issue(error));
	let unsafe = false;
	for (const document of documents) {
		visit(document, {
			Scalar(_key, node) {
				if (typeof node.value !== "number") return;
				// JSON has no Infinity or NaN; JSON.stringify writes null.
				if (!Number.isFinite(node.value)) unsafe = true;
				else if (
					typeof node.source === "string" &&
					decimalPattern.test(node.source) &&
					isUnsafeNumber(node.source)
				)
					unsafe = true;
			},
		});
	}
	try {
		const values = documents.map((document) => document.toJS());
		const value =
			values.length === 0 ? null : values.length === 1 ? values[0] : values;
		const notes = [...warnings];
		if (values.length > 1)
			notes.push({ code: "multiDocument", params: { count: values.length } });
		if (unsafe) notes.push({ code: "precisionLoss" });
		return success(JSON.stringify(value, null, indent) ?? "null", notes);
	} catch (conversionError) {
		// For example, too many alias expansions in one document.
		return failure({
			message:
				conversionError instanceof Error
					? conversionError.message
					: String(conversionError),
		});
	}
}

export function jsonToYaml(text: string, indent: YamlIndent): Result {
	const parsed = parseJsonValue(text);
	if (!parsed.ok) return failure(parsed.error);
	const document = new Document(parsed.value);
	return success(
		document.toString({ indent: Number(indent) }),
		parsed.warnings,
	);
}
