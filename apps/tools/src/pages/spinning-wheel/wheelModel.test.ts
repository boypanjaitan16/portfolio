import {
	addWheelItems,
	parseStoredWheelItems,
	randomWheelIndex,
	targetWheelRotation,
	wheelTextColor,
} from "./wheelModel";

it("adds trimmed unique names and cycles default colors", () => {
	let id = 0;
	const first = addWheelItems([], [" Alice ", "Bob", "alice", "", "Cara"], () =>
		String(++id),
	);
	expect(first.items.map((item) => item.label)).toEqual([
		"Alice",
		"Bob",
		"Cara",
	]);
	expect(first.items.map((item) => item.color)).toEqual([
		"#d95f45",
		"#e6a23c",
		"#74a876",
	]);
	expect(first.duplicates).toEqual(["alice"]);
	const second = addWheelItems(first.items, ["BOB", "Dina"], () =>
		String(++id),
	);
	expect(second.added).toBe(1);
	expect(second.duplicates).toEqual(["BOB"]);
});

it("loads only valid stored entries", () => {
	expect(parseStoredWheelItems("not json")).toEqual([]);
	expect(
		parseStoredWheelItems(
			JSON.stringify([
				{ id: "a", label: " Alice ", color: "#abcdef" },
				{ id: "b", label: "ALICE", color: "#123456" },
				{ id: "c", label: "Cara", color: "not-a-color" },
			]),
		),
	).toEqual([{ id: "a", label: "Alice", color: "#abcdef" }]);
});

it("rejects out-of-range random values and aligns each winner with the pointer", () => {
	const draws = [0xffffffff, 5];
	expect(randomWheelIndex(3, () => draws.shift() ?? 0)).toBe(2);
	for (const count of [1, 2, 3, 7, 20]) {
		for (let index = 0; index < count; index += 1) {
			const rotation = targetWheelRotation(0, index, count);
			const pointerAngle = (rotation + index * (360 / count)) % 360;
			expect(Math.min(pointerAngle, 360 - pointerAngle)).toBeCloseTo(0, 8);
			expect(rotation).toBeGreaterThanOrEqual(1800);
		}
	}
});

it("uses readable text colors on light and dark slices", () => {
	expect(wheelTextColor("#ffffff")).toBe("#111111");
	expect(wheelTextColor("#000000")).toBe("#ffffff");
});
