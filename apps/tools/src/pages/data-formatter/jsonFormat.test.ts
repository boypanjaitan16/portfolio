import {
	formatJson,
	minifyJson,
	scanJson,
	sortJsonKeys,
	validateJson,
} from "./jsonFormat";

it("formats nested values with the chosen indent and keeps empty containers", () => {
	const result = formatJson('{"a":[1,{"b":null}],"c":{},"d":[]}', "2");
	expect(result).toEqual({
		ok: true,
		output:
			'{\n  "a": [\n    1,\n    {\n      "b": null\n    }\n  ],\n  "c": {},\n  "d": []\n}',
		warnings: [],
	});
	expect(formatJson("[1]", "tab")).toMatchObject({ output: "[\n\t1\n]" });
	expect(formatJson('{"a":1}', "4")).toMatchObject({
		output: '{\n    "a": 1\n}',
	});
});

it("keeps literals, escapes, key order, and duplicate keys exactly", () => {
	const input =
		'{ "z": 12345678901234567890, "a": 1.50, "s": "\\u00e9\\n\\"", "z": -0 }';
	const result = minifyJson(input);
	expect(result).toMatchObject({
		ok: true,
		output: '{"z":12345678901234567890,"a":1.50,"s":"\\u00e9\\n\\"","z":-0}',
	});
	expect(result.ok && result.warnings).toEqual([
		{
			code: "jsonDuplicateKey",
			params: { key: '"z"' },
			line: 1,
			column: 60,
		},
	]);
});

it.each([
	['{"a":1,}', "jsonUnexpectedChar", 1, 8, { char: '"}"' }],
	['{"a" 1}', "jsonUnexpectedChar", 1, 6, { char: '"1"' }],
	["[1,\n 2", "jsonUnexpectedEnd", 2, 3, undefined],
	["[01]", "jsonInvalidNumber", 1, 2, undefined],
	["[1.]", "jsonInvalidNumber", 1, 2, undefined],
	['["a\tb"]', "jsonInvalidString", 1, 4, undefined],
	['["\\x"]', "jsonInvalidEscape", 1, 3, undefined],
	['["\\u12G4"]', "jsonInvalidEscape", 1, 3, undefined],
	["[true] x", "jsonUnexpectedChar", 1, 8, { char: '"x"' }],
	["{'a': 1}", "jsonUnexpectedChar", 1, 2, { char: '"\'"' }],
	["", "jsonUnexpectedEnd", 1, 1, undefined],
	["nul", "jsonUnexpectedChar", 1, 1, { char: '"n"' }],
] as const)(
	"reports %j as %s at %i:%i",
	(input, code, line, column, params) => {
		expect(validateJson(input)).toEqual({
			ok: false,
			error: { code, line, column, params },
		});
	},
);

it("rejects nesting deeper than the limit without overflowing the stack", () => {
	const deep = `${"[".repeat(600)}${"]".repeat(600)}`;
	expect(validateJson(deep)).toMatchObject({
		ok: false,
		error: { code: "jsonTooDeep" },
	});
});

it("sorts keys recursively and warns when numbers would be rounded", () => {
	expect(sortJsonKeys('{"b":1,"a":{"d":[{"z":0,"y":1}],"c":2}}', "2")).toEqual({
		ok: true,
		output:
			'{\n  "a": {\n    "c": 2,\n    "d": [\n      {\n        "y": 1,\n        "z": 0\n      }\n    ]\n  },\n  "b": 1\n}',
		warnings: [],
	});
	const lossy = sortJsonKeys(
		'{"n": 9007199254740993, "m": 0.12345678901234567}',
		"2",
	);
	expect(lossy.ok && lossy.warnings).toEqual([{ code: "precisionLoss" }]);
	expect(scanJson("[9007199254740991, 1.50, -0.0, 1E+2, 0]")).toMatchObject({
		ok: true,
		unsafeNumbers: false,
	});
	for (const unsafe of ["[1e400]", "[1e-400]", "[0.12345678901234567]"])
		expect(scanJson(unsafe)).toMatchObject({ unsafeNumbers: true });
});
