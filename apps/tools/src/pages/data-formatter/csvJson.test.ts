import { detectDelimiter, parseCsv, stringifyCsv } from "./csv";
import { csvToJson, inferValue, jsonToCsv, uniqueHeaders } from "./csvJson";
import { detectFormat } from "./detectFormat";

describe("parseCsv", () => {
	it("handles quotes, escaped quotes, newlines in fields, CRLF, and BOM", () => {
		const text =
			'﻿name,note\r\n"Ana","said ""hi"""\r\n\r\nBudi,"two\nlines"\nCita,5" tall';
		expect(parseCsv(text, ",")).toEqual({
			ok: true,
			rows: [
				{ fields: ["name", "note"], line: 1 },
				{ fields: ["Ana", 'said "hi"'], line: 2 },
				{ fields: ["Budi", "two\nlines"], line: 4 },
				{ fields: ["Cita", '5" tall'], line: 6 },
			],
		});
	});

	it("keeps empty fields and reports quote errors with positions", () => {
		expect(parseCsv("a;;\n", ";")).toMatchObject({
			rows: [{ fields: ["a", "", ""] }],
		});
		expect(parseCsv('a\n"open', ",")).toEqual({
			ok: false,
			error: { code: "csvUnclosedQuote", line: 2, column: 1 },
		});
		expect(parseCsv('"a"b,c', ",")).toEqual({
			ok: false,
			error: { code: "csvUnexpectedQuote", line: 1, column: 3 },
		});
	});

	it("detects the delimiter and quotes fields when needed", () => {
		expect(detectDelimiter("a;b;c\n1;2;3")).toBe(";");
		expect(detectDelimiter('a\tb\n"x,y"\tz')).toBe("\t");
		expect(detectDelimiter("single")).toBe(",");
		expect(
			stringifyCsv([["a,b", 'q"', "line\nbreak", " pad", "plain"]], ","),
		).toBe('"a,b","q""","line\nbreak"," pad",plain');
	});
});

describe("csvToJson", () => {
	it("maps rows to objects, renames headers, infers types, and warns on ragged rows", () => {
		const result = csvToJson(
			"id,name,,name\n1,Ana,x,y\n007,true,null\n2,a,b,c,extra",
			{
				delimiter: "auto",
				header: true,
				inferTypes: true,
				indent: "2",
			},
		);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(JSON.parse(result.output)).toEqual([
			{ id: 1, name: "Ana", column_3: "x", name_2: "y" },
			{ id: "007", name: true, column_3: null, name_2: "" },
			{ id: 2, name: "a", column_3: "b", name_2: "c", column_5: "extra" },
		]);
		expect(result.warnings).toEqual([
			{ code: "csvRaggedRow", line: 3, params: { expected: 4, actual: 3 } },
			{ code: "csvRaggedRow", line: 4, params: { expected: 4, actual: 5 } },
		]);
	});

	it("returns arrays of strings without a header or inference", () => {
		expect(
			csvToJson("a|1\nb|2", {
				delimiter: "|",
				header: false,
				inferTypes: false,
				indent: "2",
			}),
		).toMatchObject({
			output: '[\n  [\n    "a",\n    "1"\n  ],\n  [\n    "b",\n    "2"\n  ]\n]',
		});
		expect(
			csvToJson("", {
				delimiter: ",",
				header: true,
				inferTypes: true,
				indent: "2",
			}),
		).toMatchObject({ ok: true, output: "[]" });
	});

	it("infers only unambiguous values", () => {
		expect(inferValue("-1.5e3")).toBe(-1500);
		expect(inferValue("9007199254740993")).toBe("9007199254740993");
		expect(inferValue("1,5")).toBe("1,5");
		expect(inferValue("True")).toBe("True");
		expect(inferValue("")).toBe("");
		expect(uniqueHeaders(["a", "a", "a_2", ""])).toEqual([
			"a",
			"a_2",
			"a_2_2",
			"column_4",
		]);
	});
});

describe("jsonToCsv", () => {
	const options = { delimiter: "," as const, header: true, flatten: false };

	it("uses the union of keys in first-seen order", () => {
		expect(
			jsonToCsv('[{"a":1,"b":"x,y"},{"c":null,"a":true}]', options),
		).toMatchObject({ output: 'a,b,c\n1,"x,y",\ntrue,,' });
	});

	it("flattens nested values or writes them as JSON", () => {
		const input = '[{"id":1,"user":{"name":"Ana","tags":["a","b"]},"meta":{}}]';
		expect(jsonToCsv(input, { ...options, flatten: true })).toMatchObject({
			output: "id,user.name,user.tags.0,user.tags.1,meta\n1,Ana,a,b,{}",
		});
		expect(jsonToCsv(input, options)).toMatchObject({
			output: 'id,user,meta\n1,"{""name"":""Ana"",""tags"":[""a"",""b""]}",{}',
		});
	});

	it("supports arrays of arrays, primitives, a single object, and no header", () => {
		expect(jsonToCsv('[[1,"a"],[2,null]]', options)).toMatchObject({
			output: "1,a\n2,",
		});
		expect(jsonToCsv('["x", 2]', options)).toMatchObject({
			output: "value\nx\n2",
		});
		expect(
			jsonToCsv('{"a":1}', { ...options, header: false, delimiter: ";" }),
		).toMatchObject({ output: "1" });
		expect(jsonToCsv("[]", options)).toMatchObject({ ok: true, output: "" });
	});

	it("rejects shapes that are not tables", () => {
		expect(jsonToCsv('"text"', options)).toEqual({
			ok: false,
			error: { code: "csvShape" },
		});
		expect(jsonToCsv('[{"a":1},[2]]', options)).toMatchObject({
			ok: false,
			error: { code: "csvShape" },
		});
	});
});

it("detects formats from the extension, then the content", () => {
	expect(detectFormat("{}", "data.yml")).toBe("yaml");
	expect(detectFormat("  [1]")).toBe("json");
	expect(detectFormat("﻿<a/>")).toBe("xml");
	expect(detectFormat("a: 1")).toBe("yaml");
});
