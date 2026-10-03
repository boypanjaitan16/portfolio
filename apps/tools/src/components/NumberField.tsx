import { useState } from "react";

type NumberFieldProps = {
	label: string;
	min?: number;
	max?: number;
	step?: number;
} & (
	| { optional?: false; value: number; onCommit: (value: number) => void }
	| {
			/** Commits `null` when the field is cleared. */
			optional: true;
			value: number | null;
			onCommit: (value: number | null) => void;
	  }
);

/** A number input that lets users clear and retype without snapping back. */
export function NumberField(props: NumberFieldProps) {
	const { label, value, min, max, step } = props;
	const [draft, setDraft] = useState<string | null>(null);
	return (
		<label className="tool-label">
			{label}
			<input
				type="number"
				inputMode="decimal"
				className="tool-input font-mono"
				value={draft ?? (value === null ? "" : String(value))}
				min={min}
				max={max}
				step={step}
				onChange={(event) => {
					const text = event.target.value;
					setDraft(text);
					if (props.optional && text.trim() === "") {
						props.onCommit(null);
						return;
					}
					const next = Number.parseFloat(text);
					if (Number.isFinite(next)) props.onCommit(next);
				}}
				onBlur={() => setDraft(null)}
			/>
		</label>
	);
}
