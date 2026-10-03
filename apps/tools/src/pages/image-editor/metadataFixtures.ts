/** Byte builders for metadata tests. */

type Entry = {
	tag: number;
	ascii?: string;
	rationals?: [number, number][];
	ifd?: number;
};

/** Builds a little-endian TIFF block whose IFD pointers reference IFD indexes. */
export function buildTiff(ifds: Entry[][]): Uint8Array {
	const bytes = new Uint8Array(4096);
	const view = new DataView(bytes.buffer);
	let offset = 8;
	const ifdOffsets = ifds.map((entries) => {
		const start = offset;
		offset += 2 + entries.length * 12 + 4;
		return start;
	});
	let dataOffset = offset;
	bytes.set([0x49, 0x49]);
	view.setUint16(2, 42, true);
	view.setUint32(4, ifdOffsets[0], true);
	ifds.forEach((entries, index) => {
		let position = ifdOffsets[index];
		view.setUint16(position, entries.length, true);
		position += 2;
		for (const entry of entries) {
			view.setUint16(position, entry.tag, true);
			if (entry.ascii !== undefined) {
				const text = `${entry.ascii}\0`;
				view.setUint16(position + 2, 2, true);
				view.setUint32(position + 4, text.length, true);
				const target = text.length <= 4 ? position + 8 : dataOffset;
				if (text.length > 4) {
					view.setUint32(position + 8, dataOffset, true);
					dataOffset += text.length;
				}
				for (let char = 0; char < text.length; char += 1)
					bytes[target + char] = text.charCodeAt(char);
			} else if (entry.rationals) {
				view.setUint16(position + 2, 5, true);
				view.setUint32(position + 4, entry.rationals.length, true);
				view.setUint32(position + 8, dataOffset, true);
				for (const [numerator, denominator] of entry.rationals) {
					view.setUint32(dataOffset, numerator, true);
					view.setUint32(dataOffset + 4, denominator, true);
					dataOffset += 8;
				}
			} else if (entry.ifd !== undefined) {
				view.setUint16(position + 2, 4, true);
				view.setUint32(position + 4, 1, true);
				view.setUint32(position + 8, ifdOffsets[entry.ifd], true);
			}
			position += 12;
		}
	});
	return bytes.slice(0, dataOffset);
}

export function ascii(text: string): number[] {
	return [...text].map((char) => char.charCodeAt(0));
}

export function segment(marker: number, payload: number[]): number[] {
	const length = payload.length + 2;
	return [0xff, marker, length >> 8, length & 0xff, ...payload];
}

export function buffer(bytes: number[]): ArrayBuffer {
	return new Uint8Array(bytes).buffer;
}
