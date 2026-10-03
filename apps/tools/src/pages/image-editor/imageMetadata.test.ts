import { hasIdentifyingMetadata, readImageMetadata } from "./imageMetadata";
import { ascii, buffer, buildTiff, segment } from "./metadataFixtures";

const cameraTiff = buildTiff([
	[
		{ tag: 0x010f, ascii: "Canon" },
		{ tag: 0x0110, ascii: "EOS R6" },
		{ tag: 0x0132, ascii: "2026:01:02 03:04:05" },
		{ tag: 0x8769, ifd: 1 },
		{ tag: 0x8825, ifd: 2 },
	],
	[
		{ tag: 0x9003, ascii: "2026:01:01 10:00:00" },
		{ tag: 0xa434, ascii: "RF 35mm" },
	],
	[
		{ tag: 1, ascii: "S" },
		{
			tag: 2,
			rationals: [
				[6, 1],
				[12, 1],
				[36, 1],
			],
		},
		{ tag: 3, ascii: "E" },
		{
			tag: 4,
			rationals: [
				[106, 1],
				[49, 1],
				[3, 1],
			],
		},
	],
]);

it("reads camera details, dates, GPS, and other blocks from a JPEG", () => {
	const jpeg = [
		0xff,
		0xd8,
		...segment(0xe0, ascii("JFIF\0")),
		...segment(0xe1, [...ascii("Exif\0\0"), ...cameraTiff]),
		...segment(0xe1, ascii("http://ns.adobe.com/xap/1.0/\0<x/>")),
		...segment(0xe2, ascii("ICC_PROFILE\0")),
		...segment(0xed, ascii("Photoshop 3.0\0")),
		...segment(0xfe, ascii("hello")),
		0xff,
		0xda,
		0,
		2,
		...segment(0xe1, [...ascii("Exif\0\0"), ...cameraTiff]),
	];
	const metadata = readImageMetadata(buffer(jpeg));
	expect(metadata.fields).toEqual([
		{ key: "make", value: "Canon" },
		{ key: "model", value: "EOS R6" },
		{ key: "lens", value: "RF 35mm" },
		{ key: "dateTaken", value: "2026:01:01 10:00:00" },
		{ key: "dateModified", value: "2026:01:02 03:04:05" },
	]);
	expect(metadata.gps?.latitude).toBeCloseTo(-6.21);
	expect(metadata.gps?.longitude).toBeCloseTo(106.8175);
	expect(metadata.blocks.sort()).toEqual(
		["exif", "gps", "icc", "iptc", "text", "xmp"].sort(),
	);
	expect(hasIdentifyingMetadata(metadata)).toBe(true);
});

it("reads PNG eXIf, text, XMP, and ICC chunks", () => {
	function chunk(type: string, data: number[]): number[] {
		const length = data.length;
		return [
			(length >>> 24) & 0xff,
			(length >>> 16) & 0xff,
			(length >>> 8) & 0xff,
			length & 0xff,
			...ascii(type),
			...data,
			0,
			0,
			0,
			0,
		];
	}
	const png = [
		0x89,
		...ascii("PNG\r\n\x1a\n"),
		...chunk("IHDR", new Array(13).fill(0)),
		...chunk("eXIf", [...buildTiff([[{ tag: 0x0131, ascii: "Editor" }]])]),
		...chunk("iTXt", ascii("XML:com.adobe.xmp\0")),
		...chunk("iCCP", ascii("sRGB\0")),
		...chunk("IDAT", [0]),
		...chunk("tEXt", ascii("Comment\0hi")),
		...chunk("IEND", []),
	];
	const metadata = readImageMetadata(buffer(png));
	expect(metadata.fields).toEqual([{ key: "software", value: "Editor" }]);
	expect(metadata.gps).toBeNull();
	expect(metadata.blocks.sort()).toEqual(["exif", "icc", "text", "xmp"]);
});

it("reads WebP EXIF chunks with or without the Exif prefix", () => {
	function webp(exif: number[]): ArrayBuffer {
		const padded = exif.length % 2 ? [...exif, 0] : exif;
		const length = exif.length;
		return buffer([
			...ascii("RIFF"),
			0,
			0,
			0,
			0,
			...ascii("WEBP"),
			...ascii("EXIF"),
			length & 0xff,
			(length >> 8) & 0xff,
			0,
			0,
			...padded,
			...ascii("XMP "),
			1,
			0,
			0,
			0,
			0,
			0,
		]);
	}
	const tiff = [...buildTiff([[{ tag: 0x013b, ascii: "Ana" }]])];
	for (const data of [tiff, [...ascii("Exif\0\0"), ...tiff]]) {
		const metadata = readImageMetadata(webp(data));
		expect(metadata.fields).toEqual([{ key: "artist", value: "Ana" }]);
		expect(metadata.blocks).toEqual(["exif", "xmp"]);
	}
});

it("reports nothing for clean, unknown, or damaged files without throwing", () => {
	expect(readImageMetadata(buffer([0xff, 0xd8, 0xff, 0xda, 0, 2]))).toEqual({
		fields: [],
		gps: null,
		blocks: [],
	});
	expect(readImageMetadata(buffer(ascii("GIF89a"))).blocks).toEqual([]);
	const truncated = [
		0xff,
		0xd8,
		...segment(0xe1, [...ascii("Exif\0\0"), ...cameraTiff]),
	].slice(0, 40);
	expect(() => readImageMetadata(buffer(truncated))).not.toThrow();
	const iccOnly = readImageMetadata(
		buffer([0xff, 0xd8, ...segment(0xe2, ascii("ICC_PROFILE\0"))]),
	);
	expect(iccOnly.blocks).toEqual(["icc"]);
	expect(hasIdentifyingMetadata(iccOnly)).toBe(false);
});
