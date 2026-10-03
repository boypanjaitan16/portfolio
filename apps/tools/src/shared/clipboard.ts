/** Copies text, falling back to a hidden textarea when the Clipboard API is denied. */
export async function copyText(value: string): Promise<void> {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(value);
			return;
		}
	} catch {
		// A browser can deny Clipboard API access even after a user action.
	}
	const previouslyFocused =
		document.activeElement instanceof HTMLElement
			? document.activeElement
			: null;
	const input = document.createElement("textarea");
	input.value = value;
	input.readOnly = true;
	input.style.position = "fixed";
	input.style.left = "-9999px";
	document.body.append(input);
	let copied = false;
	try {
		input.select();
		copied = document.execCommand?.("copy") ?? false;
	} finally {
		input.remove();
		previouslyFocused?.focus();
	}
	if (!copied) throw new Error("copy");
}
