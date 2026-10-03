export type DataFormat = "json" | "yaml" | "xml";

/** Guesses the format from a file extension, then from the first character. */
export function detectFormat(text: string, fileName?: string): DataFormat {
	const extension = fileName?.toLowerCase().split(".").pop();
	if (extension === "json") return "json";
	if (extension === "yaml" || extension === "yml") return "yaml";
	if (extension === "xml") return "xml";
	const first = text.replace(/^﻿/, "").trimStart()[0];
	if (first === "{" || first === "[") return "json";
	if (first === "<") return "xml";
	return "yaml";
}
