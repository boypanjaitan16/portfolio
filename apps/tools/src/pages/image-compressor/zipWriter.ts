export type ZipEntry = { name: string; data: Uint8Array<ArrayBuffer> };

const crcTable = (() => {
	const table = new Uint32Array(256);
	for (let index = 0; index < 256; index += 1) {
		let value = index;
		for (let bit = 0; bit < 8; bit += 1)
			value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
		table[index] = value >>> 0;
	}
	return table;
})();

export function crc32(data: Uint8Array): number {
	let crc = 0xffffffff;
	for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
	return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): { time: number; date: number } {
	const year = Math.min(Math.max(date.getFullYear(), 1980), 2107);
	return {
		time:
			(date.getHours() << 11) |
			(date.getMinutes() << 5) |
			Math.floor(date.getSeconds() / 2),
		date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
	};
}

/** Makes names unique without changing their extensions: `a.jpg`, `a (2).jpg`. */
export function uniqueNames(names: readonly string[]): string[] {
	const used = new Set<string>();
	return names.map((name) => {
		const match = /^(.*?)(\.[^.]*)?$/.exec(name);
		const base = match?.[1] ?? name;
		const extension = match?.[2] ?? "";
		let candidate = name;
		for (let count = 2; used.has(candidate.toLowerCase()); count += 1)
			candidate = `${base} (${count})${extension}`;
		used.add(candidate.toLowerCase());
		return candidate;
	});
}

/**
 * Returns the parts of a ZIP archive that stores entries without compression.
 * Images are already compressed, so deflating them would save little. Entry
 * data is referenced, not copied; wrap the parts in a Blob to download them.
 */
export function zipParts(
	entries: readonly ZipEntry[],
	modified = new Date(),
): Uint8Array<ArrayBuffer>[] {
	const encoder = new TextEncoder();
	const stamp = dosDateTime(modified);
	const parts: Uint8Array<ArrayBuffer>[] = [];
	const central: Uint8Array<ArrayBuffer>[] = [];
	let offset = 0;
	for (const entry of entries) {
		const name = encoder.encode(entry.name);
		const crc = crc32(entry.data);
		const size = entry.data.length;
		const local = new Uint8Array(30 + name.length);
		const localView = new DataView(local.buffer);
		localView.setUint32(0, 0x04034b50, true);
		localView.setUint16(4, 20, true);
		localView.setUint16(6, 0x0800, true); // UTF-8 names
		localView.setUint16(8, 0, true); // stored
		localView.setUint16(10, stamp.time, true);
		localView.setUint16(12, stamp.date, true);
		localView.setUint32(14, crc, true);
		localView.setUint32(18, size, true);
		localView.setUint32(22, size, true);
		localView.setUint16(26, name.length, true);
		local.set(name, 30);

		const header = new Uint8Array(46 + name.length);
		const headerView = new DataView(header.buffer);
		headerView.setUint32(0, 0x02014b50, true);
		headerView.setUint16(4, 20, true);
		headerView.setUint16(6, 20, true);
		headerView.setUint16(8, 0x0800, true);
		headerView.setUint16(10, 0, true);
		headerView.setUint16(12, stamp.time, true);
		headerView.setUint16(14, stamp.date, true);
		headerView.setUint32(16, crc, true);
		headerView.setUint32(20, size, true);
		headerView.setUint32(24, size, true);
		headerView.setUint16(28, name.length, true);
		headerView.setUint32(42, offset, true);
		header.set(name, 46);

		parts.push(local, entry.data);
		central.push(header);
		offset += local.length + size;
	}
	const centralSize = central.reduce((total, part) => total + part.length, 0);
	const end = new Uint8Array(22);
	const endView = new DataView(end.buffer);
	endView.setUint32(0, 0x06054b50, true);
	endView.setUint16(8, entries.length, true);
	endView.setUint16(10, entries.length, true);
	endView.setUint32(12, centralSize, true);
	endView.setUint32(16, offset, true);
	return [...parts, ...central, end];
}
