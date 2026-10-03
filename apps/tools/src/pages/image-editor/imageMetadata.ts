export type MetadataFieldKey =
	| "make"
	| "model"
	| "lens"
	| "software"
	| "dateTaken"
	| "dateModified"
	| "artist"
	| "copyright";

export type MetadataField = { key: MetadataFieldKey; value: string };

export type MetadataBlock = "exif" | "gps" | "xmp" | "iptc" | "icc" | "text";

export type GpsPosition = { latitude: number; longitude: number };

export type ImageMetadata = {
	fields: MetadataField[];
	gps: GpsPosition | null;
	blocks: MetadataBlock[];
};

/** Blocks that can identify a person, device, place, or time. */
export const identifyingBlocks: readonly MetadataBlock[] = [
	"exif",
	"gps",
	"xmp",
	"iptc",
	"text",
];

const ifd0Tags: Record<number, MetadataFieldKey> = {
	271: "make",
	272: "model",
	305: "software",
	306: "dateModified",
	315: "artist",
	33432: "copyright",
};
const exifTags: Record<number, MetadataFieldKey> = {
	36867: "dateTaken",
	42036: "lens",
};
const fieldOrder: MetadataFieldKey[] = [
	"make",
	"model",
	"lens",
	"software",
	"dateTaken",
	"dateModified",
	"artist",
	"copyright",
];
const typeSizes: Record<number, number> = {
	1: 1,
	2: 1,
	3: 2,
	4: 4,
	5: 8,
	7: 1,
	9: 4,
	10: 8,
};
const maxIfdEntries = 1000;

type TiffValue = string | number[];
type TiffResult = {
	fields: Map<MetadataFieldKey, string>;
	gps: GpsPosition | null;
};

function ascii(bytes: Uint8Array, start: number, length: number): string {
	let text = "";
	for (let index = start; index < start + length; index += 1) {
		const code = bytes[index];
		if (code === 0) break;
		text += String.fromCharCode(code);
	}
	return text;
}

function startsWith(bytes: Uint8Array, start: number, text: string): boolean {
	if (start + text.length > bytes.length) return false;
	for (let index = 0; index < text.length; index += 1)
		if (bytes[start + index] !== text.charCodeAt(index)) return false;
	return true;
}

function readTiff(view: DataView, start: number, end: number): TiffResult {
	const result: TiffResult = { fields: new Map(), gps: null };
	if (end - start < 8) return result;
	const order = view.getUint16(start);
	if (order !== 0x4949 && order !== 0x4d4d) return result;
	const little = order === 0x4949;
	if (view.getUint16(start + 2, little) !== 42) return result;
	const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
	const visited = new Set<number>();

	function readIfd(offset: number): Map<number, TiffValue> {
		const values = new Map<number, TiffValue>();
		const position = start + offset;
		if (visited.has(offset) || position < start || position + 2 > end)
			return values;
		visited.add(offset);
		const count = Math.min(view.getUint16(position, little), maxIfdEntries);
		for (let index = 0; index < count; index += 1) {
			const entry = position + 2 + index * 12;
			if (entry + 12 > end) break;
			const tag = view.getUint16(entry, little);
			const type = view.getUint16(entry + 2, little);
			const items = view.getUint32(entry + 4, little);
			const size = (typeSizes[type] ?? 0) * items;
			if (size === 0) continue;
			const data =
				size <= 4 ? entry + 8 : start + view.getUint32(entry + 8, little);
			if (data < start || data + size > end) continue;
			if (type === 2) {
				values.set(tag, ascii(bytes, data, size).trim());
			} else if (type === 3) {
				values.set(tag, [view.getUint16(data, little)]);
			} else if (type === 4 || type === 9) {
				values.set(tag, [view.getUint32(data, little)]);
			} else if (type === 5 || type === 10) {
				const parts: number[] = [];
				for (let item = 0; item < Math.min(items, 4); item += 1) {
					const numerator = view.getUint32(data + item * 8, little);
					const denominator = view.getUint32(data + item * 8 + 4, little);
					parts.push(denominator === 0 ? 0 : numerator / denominator);
				}
				values.set(tag, parts);
			}
		}
		return values;
	}

	function pointer(values: Map<number, TiffValue>, tag: number) {
		const value = values.get(tag);
		return Array.isArray(value) ? value[0] : undefined;
	}

	function collect(
		values: Map<number, TiffValue>,
		tags: Record<number, MetadataFieldKey>,
	) {
		for (const [tag, key] of Object.entries(tags)) {
			const value = values.get(Number(tag));
			if (typeof value === "string" && value) result.fields.set(key, value);
		}
	}

	const ifd0 = readIfd(view.getUint32(start + 4, little));
	collect(ifd0, ifd0Tags);
	const exifOffset = pointer(ifd0, 0x8769);
	if (exifOffset !== undefined) collect(readIfd(exifOffset), exifTags);
	const gpsOffset = pointer(ifd0, 0x8825);
	if (gpsOffset !== undefined) {
		const gps = readIfd(gpsOffset);
		const latitude = gps.get(2);
		const longitude = gps.get(4);
		if (Array.isArray(latitude) && Array.isArray(longitude)) {
			const toDecimal = ([degrees = 0, minutes = 0, seconds = 0]: number[]) =>
				degrees + minutes / 60 + seconds / 3600;
			const latSign = gps.get(1) === "S" ? -1 : 1;
			const lonSign = gps.get(3) === "W" ? -1 : 1;
			result.gps = {
				latitude: latSign * toDecimal(latitude),
				longitude: lonSign * toDecimal(longitude),
			};
		}
	}
	return result;
}

function emptyMetadata(): ImageMetadata {
	return { fields: [], gps: null, blocks: [] };
}

class MetadataCollector {
	readonly fields = new Map<MetadataFieldKey, string>();
	readonly blocks = new Set<MetadataBlock>();
	gps: GpsPosition | null = null;

	addTiff(view: DataView, start: number, end: number) {
		this.blocks.add("exif");
		const tiff = readTiff(view, start, end);
		for (const [key, value] of tiff.fields)
			if (!this.fields.has(key)) this.fields.set(key, value);
		if (tiff.gps) {
			this.gps ??= tiff.gps;
			this.blocks.add("gps");
		}
	}

	result(): ImageMetadata {
		return {
			fields: fieldOrder.flatMap((key) => {
				const value = this.fields.get(key);
				return value ? [{ key, value }] : [];
			}),
			gps: this.gps,
			blocks: [...this.blocks],
		};
	}
}

function readJpeg(view: DataView, bytes: Uint8Array, out: MetadataCollector) {
	let offset = 2;
	while (offset + 4 <= bytes.length) {
		if (bytes[offset] !== 0xff) break;
		const marker = bytes[offset + 1];
		if (marker === 0xff) {
			offset += 1;
			continue;
		}
		// Start of scan and end of image: metadata segments come before them.
		if (marker === 0xda || marker === 0xd9) break;
		if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
			offset += 2;
			continue;
		}
		const length = view.getUint16(offset + 2);
		const start = offset + 4;
		const end = Math.min(offset + 2 + length, bytes.length);
		if (length < 2) break;
		if (marker === 0xe1 && startsWith(bytes, start, "Exif\0\0"))
			out.addTiff(view, start + 6, end);
		else if (
			marker === 0xe1 &&
			startsWith(bytes, start, "http://ns.adobe.com/")
		)
			out.blocks.add("xmp");
		else if (marker === 0xed) out.blocks.add("iptc");
		else if (marker === 0xe2 && startsWith(bytes, start, "ICC_PROFILE"))
			out.blocks.add("icc");
		else if (marker === 0xfe) out.blocks.add("text");
		offset = offset + 2 + length;
	}
}

function readPng(view: DataView, bytes: Uint8Array, out: MetadataCollector) {
	let offset = 8;
	while (offset + 8 <= bytes.length) {
		const length = view.getUint32(offset);
		const type = ascii(bytes, offset + 4, 4);
		const start = offset + 8;
		const end = start + length;
		if (end > bytes.length) break;
		if (type === "eXIf") out.addTiff(view, start, end);
		else if (type === "iTXt" && startsWith(bytes, start, "XML:com.adobe.xmp"))
			out.blocks.add("xmp");
		else if (type === "tEXt" || type === "zTXt" || type === "iTXt")
			out.blocks.add("text");
		else if (type === "iCCP") out.blocks.add("icc");
		else if (type === "IEND") break;
		offset = end + 4;
	}
}

function readWebp(view: DataView, bytes: Uint8Array, out: MetadataCollector) {
	let offset = 12;
	while (offset + 8 <= bytes.length) {
		const type = ascii(bytes, offset, 4);
		const length = view.getUint32(offset + 4, true);
		const start = offset + 8;
		const end = start + length;
		if (end > bytes.length) break;
		if (type === "EXIF") {
			const tiffStart = startsWith(bytes, start, "Exif\0\0")
				? start + 6
				: start;
			out.addTiff(view, tiffStart, end);
		} else if (type === "XMP ") out.blocks.add("xmp");
		else if (type === "ICCP") out.blocks.add("icc");
		offset = end + (length % 2);
	}
}

/** Reports metadata found in a PNG, JPEG, or WebP file without changing it. */
export function readImageMetadata(buffer: ArrayBuffer): ImageMetadata {
	const bytes = new Uint8Array(buffer);
	const view = new DataView(buffer);
	const out = new MetadataCollector();
	try {
		if (bytes[0] === 0xff && bytes[1] === 0xd8) readJpeg(view, bytes, out);
		else if (startsWith(bytes, 0, "\x89PNG\r\n\x1a\n"))
			readPng(view, bytes, out);
		else if (startsWith(bytes, 0, "RIFF") && startsWith(bytes, 8, "WEBP"))
			readWebp(view, bytes, out);
		else return emptyMetadata();
	} catch {
		// Damaged metadata should not block editing; report what was read.
	}
	return out.result();
}

export function hasIdentifyingMetadata(metadata: ImageMetadata): boolean {
	return metadata.blocks.some((block) => identifyingBlocks.includes(block));
}
