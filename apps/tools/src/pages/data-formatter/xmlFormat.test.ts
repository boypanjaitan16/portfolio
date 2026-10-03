import {
	formatXml,
	minifyXml,
	parserErrorIssue,
	validateXml,
} from "./xmlFormat";

it("pretty-prints nested elements and keeps text, CDATA, and markup", () => {
	const input =
		'<?xml version="1.0"?><!DOCTYPE note [<!ENTITY x "y">]><note a="1 > 0"><to>Ana </to><!-- hi --><body><![CDATA[<b>]]></body><empty></empty><self /></note>';
	expect(formatXml(input, "2")).toEqual({
		ok: true,
		output: [
			'<?xml version="1.0"?>',
			'<!DOCTYPE note [<!ENTITY x "y">]>',
			'<note a="1 > 0">',
			"  <to>Ana </to>",
			"  <!-- hi -->",
			"  <body><![CDATA[<b>]]></body>",
			"  <empty></empty>",
			"  <self />",
			"</note>",
		].join("\n"),
		warnings: [],
	});
});

it("keeps mixed content and xml:space preserve verbatim", () => {
	const input =
		'<doc>\n<p>Hello <b>world</b>!</p>\n<pre xml:space="preserve">\n  <x/>  </pre>\n</doc>';
	expect(formatXml(input, "tab")).toMatchObject({
		output:
			'<doc>\n\t<p>Hello <b>world</b>!</p>\n\t<pre xml:space="preserve">\n  <x/>  </pre>\n</doc>',
	});
});

it("minifies whitespace between tags only", () => {
	expect(minifyXml("<a>\n  <b> x </b>\n  <!-- c -->\n</a>\n")).toMatchObject({
		output: "<a><b> x </b><!-- c --></a>",
	});
});

it("reports parser errors with line and column", () => {
	expect(validateXml("<a>\n<b></a>")).toMatchObject({
		ok: false,
		error: { line: 2, message: "unexpected close tag." },
	});
	expect(formatXml("<a></a><b/>", "2")).toMatchObject({ ok: false });
});

it.each([
	[
		"This page contains the following errors:error on line 3 at column 5: Opening and ending tag mismatch: b line 1 and a\nBelow is a rendering of the page up to the first error.",
		{
			message: "Opening and ending tag mismatch: b line 1 and a",
			line: 3,
			column: 5,
		},
	],
	[
		"XML Parsing Error: mismatched tag. Expected: </b>.\nLocation: about:blank\nLine Number 2, Column 8:<a><b></a>\n-------^",
		{ message: "mismatched tag. Expected: </b>.", line: 2, column: 8 },
	],
	[
		"4:0: document must contain a root element.",
		{
			message: "document must contain a root element.",
			line: 4,
			column: 1,
		},
	],
	["Something odd", { message: "Something odd" }],
])("reads browser error text %#", (text, issue) => {
	expect(parserErrorIssue(text)).toEqual(issue);
});
