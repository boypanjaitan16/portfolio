import { diagnosticCount, forEachDiagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { render, screen } from "@testing-library/react";
import { CodeEditor } from "./CodeEditor";

function view(label: string): EditorView {
	const content = screen.getByRole("textbox", { name: label });
	const editorView = EditorView.findFromDOM(content);
	if (!editorView) throw new Error("No editor view");
	return editorView;
}

it("mounts CodeMirror, reports edits, and syncs value and issues from props", () => {
	const onChange = vi.fn();
	const { rerender } = render(
		<CodeEditor
			value='{"a":1}'
			onChange={onChange}
			language="json"
			label="Input"
		/>,
	);
	const editor = view("Input");
	expect(editor.state.doc.toString()).toBe('{"a":1}');

	editor.dispatch({
		changes: { from: 0, to: editor.state.doc.length, insert: "[1," },
		userEvent: "input.type",
	});
	expect(onChange).toHaveBeenCalledWith("[1,");

	onChange.mockClear();
	rerender(
		<CodeEditor
			value={"[1,\n2"}
			onChange={onChange}
			language="json"
			label="Input"
			issues={[{ line: 2, column: 2, message: "The JSON ends too early." }]}
		/>,
	);
	expect(editor.state.doc.toString()).toBe("[1,\n2");
	// Prop updates are not echoed back as user edits.
	expect(onChange).not.toHaveBeenCalled();
	expect(diagnosticCount(editor.state)).toBe(1);
	const found: { from: number; message: string }[] = [];
	forEachDiagnostic(editor.state, (diagnostic, from) =>
		found.push({ from, message: diagnostic.message }),
	);
	expect(found).toEqual([{ from: 5, message: "The JSON ends too early." }]);

	rerender(
		<CodeEditor
			value={"[1,\n2"}
			onChange={onChange}
			language="json"
			label="Input"
		/>,
	);
	expect(diagnosticCount(editor.state)).toBe(0);
});

it("can be read-only and ignores issues outside the document", () => {
	render(
		<CodeEditor
			value="x"
			language="yaml"
			label="Output"
			readOnly
			issues={[{ line: 9, message: "Out of range" }]}
		/>,
	);
	const editor = view("Output");
	expect(editor.state.readOnly).toBe(true);
	expect(diagnosticCount(editor.state)).toBe(0);
});
