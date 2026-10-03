import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import {
	bracketMatching,
	defaultHighlightStyle,
	foldGutter,
	foldKeymap,
	syntaxHighlighting,
} from "@codemirror/language";
import { type Diagnostic, lintGutter, setDiagnostics } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import {
	Compartment,
	EditorState,
	type Extension,
	type Text,
} from "@codemirror/state";
import {
	EditorView,
	highlightActiveLine,
	highlightActiveLineGutter,
	keymap,
	lineNumbers,
	placeholder as placeholderText,
} from "@codemirror/view";
import { useEffect, useRef } from "react";

export type EditorLanguage = "json" | "yaml" | "xml" | "text";

export type EditorIssue = { line: number; column?: number; message: string };

export type CodeEditorProps = {
	value: string;
	onChange?: (value: string) => void;
	language: EditorLanguage;
	label: string;
	readOnly?: boolean;
	placeholder?: string;
	issues?: EditorIssue[];
};

const noIssues: EditorIssue[] = [];

const languages: Record<EditorLanguage, () => Extension> = {
	json: () => json(),
	yaml: () => yaml(),
	xml: () => xml(),
	text: () => [],
};

const theme = EditorView.theme({
	"&": {
		height: "24rem",
		backgroundColor: "#fff",
		border: "1px solid #11111140",
		fontSize: "13px",
	},
	"&.cm-focused": {
		outline: "2px solid var(--portfolio-primary)",
		outlineOffset: "-1px",
	},
	".cm-scroller": {
		fontFamily: "var(--portfolio-font-mono)",
		overflow: "auto",
	},
	".cm-gutters": {
		backgroundColor: "#f6f5f1",
		borderRight: "1px solid #11111120",
		color: "#11111180",
	},
	".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "#11111108" },
	".cm-placeholder": { color: "#11111180" },
});

function toDiagnostics(doc: Text, issues: EditorIssue[]): Diagnostic[] {
	return issues.flatMap((issue) => {
		if (issue.line < 1 || issue.line > doc.lines) return [];
		const line = doc.line(issue.line);
		const from = Math.min(
			line.from + Math.max(0, (issue.column ?? 1) - 1),
			line.to,
		);
		return [
			{
				from,
				to: Math.min(from + 1, line.to),
				severity: "error",
				message: issue.message,
			},
		];
	});
}

/** One CodeMirror 6 view; `value` and `issues` stay in sync with props. */
export function CodeEditor({
	value,
	onChange,
	language,
	label,
	readOnly = false,
	placeholder = "",
	issues = noIssues,
}: CodeEditorProps) {
	const hostRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const onChangeRef = useRef(onChange);
	const compartments = useRef({
		language: new Compartment(),
		readOnly: new Compartment(),
		attributes: new Compartment(),
	});
	onChangeRef.current = onChange;

	// The view is created once; later prop changes are dispatched below.
	// biome-ignore lint/correctness/useExhaustiveDependencies: mount only
	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		const {
			language: languageSlot,
			readOnly: readOnlySlot,
			attributes,
		} = compartments.current;
		const view = new EditorView({
			parent: host,
			state: EditorState.create({
				doc: value,
				extensions: [
					lineNumbers(),
					highlightActiveLineGutter(),
					foldGutter(),
					lintGutter(),
					history(),
					bracketMatching(),
					highlightActiveLine(),
					highlightSelectionMatches(),
					syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
					EditorView.lineWrapping,
					// Tab is left to the browser so keyboard users can leave the editor.
					keymap.of([
						...defaultKeymap,
						...historyKeymap,
						...searchKeymap,
						...foldKeymap,
					]),
					theme,
					languageSlot.of(languages[language]()),
					readOnlySlot.of([
						EditorState.readOnly.of(readOnly),
						EditorView.editable.of(!readOnly),
					]),
					attributes.of([
						EditorView.contentAttributes.of({ "aria-label": label }),
						placeholderText(placeholder),
					]),
					EditorView.updateListener.of((update) => {
						if (
							update.docChanged &&
							!update.transactions.some((t) => t.isUserEvent("sync"))
						)
							onChangeRef.current?.(update.state.doc.toString());
					}),
				],
			}),
		});
		viewRef.current = view;
		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, []);

	useEffect(() => {
		const view = viewRef.current;
		if (!view || view.state.doc.toString() === value) return;
		view.dispatch({
			changes: { from: 0, to: view.state.doc.length, insert: value },
			userEvent: "sync",
		});
	}, [value]);

	useEffect(() => {
		viewRef.current?.dispatch({
			effects: compartments.current.language.reconfigure(languages[language]()),
		});
	}, [language]);

	useEffect(() => {
		viewRef.current?.dispatch({
			effects: [
				compartments.current.readOnly.reconfigure([
					EditorState.readOnly.of(readOnly),
					EditorView.editable.of(!readOnly),
				]),
				compartments.current.attributes.reconfigure([
					EditorView.contentAttributes.of({ "aria-label": label }),
					placeholderText(placeholder),
				]),
			],
		});
	}, [readOnly, label, placeholder]);

	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		view.dispatch(
			setDiagnostics(view.state, toDiagnostics(view.state.doc, issues)),
		);
	}, [issues]);

	return <div ref={hostRef} className="min-w-0 text-left" />;
}
