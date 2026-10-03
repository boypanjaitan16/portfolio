import { crc32, uniqueNames, zipParts } from "./zipWriter";

function concat(parts: Uint8Array[]): Uint8Array {
	const bytes = new Uint8Array(
		parts.reduce((sum, part) => sum + part.length, 0),
	);
	let offset = 0;
	for (const part of parts) {
		bytes.set(part, offset);
		offset += part.length;
	}
	return bytes;
}

it("computes the standard CRC-32", () => {
	expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
	expect(crc32(new Uint8Array())).toBe(0);
});

it("dedupes names case-insensitively and keeps extensions", () => {
	expect(uniqueNames(["a.jpg", "A.jpg", "a.jpg", "b", "b"])).toEqual([
		"a.jpg",
		"A (2).jpg",
		"a (3).jpg",
		"b",
		"b (2)",
	]);
});

it("writes stored entries with a central directory that points at them", () => {
	const encoder = new TextEncoder();
	const entries = [
		{ name: "one.png", data: encoder.encode("first") },
		{ name: "gambar-é.jpg", data: encoder.encode("second!") },
	];
	const zip = concat(zipParts(entries, new Date(2026, 9, 3, 12, 30, 10)));
	const view = new DataView(zip.buffer);
	const end = zip.length - 22;
	expect(view.getUint32(end, true)).toBe(0x06054b50);
	expect(view.getUint16(end + 10, true)).toBe(2);
	let central = view.getUint32(end + 16, true);
	const decoder = new TextDecoder();
	entries.forEach((entry, index) => {
		expect(view.getUint32(central, true)).toBe(0x02014b50);
		expect(view.getUint16(central + 8, true)).toBe(0x0800);
		expect(view.getUint32(central + 16, true)).toBe(crc32(entry.data));
		const nameLength = view.getUint16(central + 28, true);
		expect(
			decoder.decode(zip.slice(central + 46, central + 46 + nameLength)),
		).toBe(entry.name);
		const local = view.getUint32(central + 42, true);
		expect(view.getUint32(local, true)).toBe(0x04034b50);
		expect(view.getUint16(local + 8, true)).toBe(0);
		// DOS date: 2026-10-03, time: 12:30:10.
		expect(view.getUint16(local + 12, true)).toBe((46 << 9) | (10 << 5) | 3);
		expect(view.getUint16(local + 10, true)).toBe((12 << 11) | (30 << 5) | 5);
		const dataStart = local + 30 + view.getUint16(local + 26, true);
		expect(
			decoder.decode(zip.slice(dataStart, dataStart + entry.data.length)),
		).toBe(index === 0 ? "first" : "second!");
		central += 46 + nameLength;
	});
	expect(central).toBe(end);
});
