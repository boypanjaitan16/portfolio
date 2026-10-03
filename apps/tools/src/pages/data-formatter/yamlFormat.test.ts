import { formatYaml, jsonToYaml, validateYaml, yamlToJson } from "./yamlFormat";

it("re-indents documents and keeps comments and scalar spelling", () => {
	const input =
		"# config\nlist:\n - 0x1F\n - 1e3\nbig: 12345678901234567890\nnone: ~\n---\nnext: true\n";
	expect(formatYaml(input, "4")).toEqual({
		ok: true,
		output:
			"# config\nlist:\n    - 0x1F\n    - 1e3\nbig: 12345678901234567890\nnone: ~\n---\nnext: true\n",
		warnings: [],
	});
});

it("reports the first error with its position", () => {
	expect(validateYaml("a: 1\na: 2\n")).toEqual({
		ok: false,
		error: { message: "Map keys must be unique", line: 2, column: 1 },
	});
	expect(validateYaml("key: value\n  bad: indent")).toMatchObject({
		ok: false,
		error: { line: 1, column: 6 },
	});
	expect(validateYaml("")).toMatchObject({ ok: true });
});

it("converts YAML to JSON with multi-document and precision notes", () => {
	expect(yamlToJson("a: &x [1, 2]\nb: *x\n", "  ")).toEqual({
		ok: true,
		output: '{\n  "a": [\n    1,\n    2\n  ],\n  "b": [\n    1,\n    2\n  ]\n}',
		warnings: [],
	});
	expect(yamlToJson("a: 1\n---\nb: 9007199254740993\n", "")).toEqual({
		ok: true,
		output: '[{"a":1},{"b":9007199254740992}]',
		warnings: [
			{ code: "multiDocument", params: { count: 2 } },
			{ code: "precisionLoss" },
		],
	});
	expect(yamlToJson("", "")).toMatchObject({ ok: true, output: "null" });
	expect(yamlToJson("[0x1F, 0o17, 1.50]", "")).toEqual({
		ok: true,
		output: "[31,15,1.5]",
		warnings: [],
	});
	expect(yamlToJson("[.inf]", "")).toMatchObject({
		output: "[null]",
		warnings: [{ code: "precisionLoss" }],
	});
});

it("refuses alias bombs instead of hanging", () => {
	const bomb = [
		"a: &a [x, x, x, x, x, x, x, x, x, x]",
		"b: &b [*a, *a, *a, *a, *a, *a, *a, *a, *a, *a]",
		"c: &c [*b, *b, *b, *b, *b, *b, *b, *b, *b, *b]",
		"d: [*c, *c, *c, *c, *c, *c, *c, *c, *c, *c]",
	].join("\n");
	expect(yamlToJson(bomb, "")).toMatchObject({ ok: false });
});

it("converts JSON to YAML and reports JSON errors", () => {
	expect(jsonToYaml('{"a":[1,{"b":null}],"s":"x: y"}', "2")).toEqual({
		ok: true,
		output: 'a:\n  - 1\n  - b: null\ns: "x: y"\n',
		warnings: [],
	});
	expect(jsonToYaml("{", "2")).toMatchObject({
		ok: false,
		error: { code: "jsonUnexpectedEnd" },
	});
});
