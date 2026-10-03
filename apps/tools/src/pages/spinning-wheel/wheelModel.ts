export type WheelItem = {
	id: string;
	label: string;
	color: string;
};

export const wheelStorageKey = "tools-spinning-wheel-items-v1";
export const wheelPalette = [
	"#d95f45",
	"#e6a23c",
	"#74a876",
	"#5b91b2",
	"#9672b5",
	"#d4779d",
] as const;

export function normalizedLabel(label: string): string {
	return label.trim().toLocaleLowerCase();
}

export function addWheelItems(
	items: WheelItem[],
	labels: string[],
	createId: () => string = () => crypto.randomUUID(),
): { items: WheelItem[]; added: number; duplicates: string[] } {
	const next = [...items];
	const names = new Set(items.map((item) => normalizedLabel(item.label)));
	const duplicates: string[] = [];
	for (const raw of labels) {
		const label = raw.trim();
		if (!label) continue;
		const normalized = normalizedLabel(label);
		if (names.has(normalized)) {
			duplicates.push(label);
			continue;
		}
		names.add(normalized);
		next.push({
			id: createId(),
			label,
			color: wheelPalette[next.length % wheelPalette.length],
		});
	}
	return { items: next, added: next.length - items.length, duplicates };
}

export function parseStoredWheelItems(raw: string | null): WheelItem[] {
	if (!raw) return [];
	try {
		const value: unknown = JSON.parse(raw);
		if (!Array.isArray(value)) return [];
		const names = new Set<string>();
		const ids = new Set<string>();
		const items: WheelItem[] = [];
		for (const candidate of value) {
			if (
				typeof candidate !== "object" ||
				candidate === null ||
				typeof candidate.id !== "string" ||
				typeof candidate.label !== "string" ||
				typeof candidate.color !== "string"
			)
				continue;
			const label = candidate.label.trim();
			const name = normalizedLabel(label);
			if (
				!label ||
				!candidate.id ||
				ids.has(candidate.id) ||
				names.has(name) ||
				!/^#[0-9a-fA-F]{6}$/.test(candidate.color)
			)
				continue;
			ids.add(candidate.id);
			names.add(name);
			items.push({ id: candidate.id, label, color: candidate.color });
		}
		return items;
	} catch {
		return [];
	}
}

export function randomWheelIndex(
	count: number,
	getRandomValue: () => number = () =>
		crypto.getRandomValues(new Uint32Array(1))[0],
): number {
	if (!Number.isSafeInteger(count) || count < 1 || count > 0x100000000)
		throw new RangeError("Wheel item count must be between 1 and 2^32.");
	const range = 0x100000000;
	const limit = range - (range % count);
	let value: number;
	do {
		value = getRandomValue();
	} while (value >= limit);
	return value % count;
}

export function targetWheelRotation(
	currentRotation: number,
	winnerIndex: number,
	count: number,
): number {
	const sectorAngle = 360 / count;
	const desired =
		(((-winnerIndex * sectorAngle - currentRotation) % 360) + 360) % 360;
	return currentRotation + 5 * 360 + desired;
}

export function wheelTextColor(hex: string): string {
	const channels = [1, 3, 5].map((index) => {
		const value = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
		return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	});
	const luminance =
		channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
	return luminance > 0.179 ? "#111111" : "#ffffff";
}
