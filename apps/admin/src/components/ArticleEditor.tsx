import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button, Tooltip } from "antd";
import {
	Bold,
	Heading1,
	Heading2,
	ImagePlus,
	Italic,
	Link2,
	List,
	ListOrdered,
	Quote,
} from "lucide-react";
import { useRef } from "react";
import type { PendingImage } from "../lib/articleMedia";
import { validateImage } from "../lib/articleMedia";

type Props = {
	content: string;
	onChange: (html: string) => void;
	onAddImage: (image: PendingImage) => void;
	onError: (message: string) => void;
};

export function ArticleEditor({
	content,
	onChange,
	onAddImage,
	onError,
}: Props) {
	const fileInput = useRef<HTMLInputElement>(null);
	const editor = useEditor({
		extensions: [StarterKit, Image],
		content,
		onUpdate: ({ editor: current }) => onChange(current.getHTML()),
		editorProps: { attributes: { class: "min-h-[320px] p-5 outline-none" } },
	});
	if (!editor) return null;

	const addFile = (file: File) => {
		try {
			validateImage(file);
			const url = URL.createObjectURL(file);
			onAddImage({ url, file });
			editor.chain().focus().setImage({ src: url, alt: file.name }).run();
		} catch (reason) {
			onError(
				reason instanceof Error ? reason.message : "Could not add the image.",
			);
		}
	};

	const addLink = () => {
		const value = window.prompt("Link URL", "");
		if (value === null) return;
		if (value === "") {
			editor.chain().focus().unsetLink().run();
			return;
		}
		if (!/^https?:\/\//i.test(value)) {
			onError("Links must start with http:// or https://.");
			return;
		}
		editor.chain().focus().setLink({ href: value }).run();
	};

	const buttons = [
		{
			label: "Bold",
			icon: <Bold size={16} />,
			action: () => editor.chain().focus().toggleBold().run(),
		},
		{
			label: "Italic",
			icon: <Italic size={16} />,
			action: () => editor.chain().focus().toggleItalic().run(),
		},
		{
			label: "Heading 1",
			icon: <Heading1 size={16} />,
			action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
		},
		{
			label: "Heading 2",
			icon: <Heading2 size={16} />,
			action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
		},
		{
			label: "Bulleted list",
			icon: <List size={16} />,
			action: () => editor.chain().focus().toggleBulletList().run(),
		},
		{
			label: "Numbered list",
			icon: <ListOrdered size={16} />,
			action: () => editor.chain().focus().toggleOrderedList().run(),
		},
		{
			label: "Quote",
			icon: <Quote size={16} />,
			action: () => editor.chain().focus().toggleBlockquote().run(),
		},
		{ label: "Link", icon: <Link2 size={16} />, action: addLink },
		{
			label: "Image",
			icon: <ImagePlus size={16} />,
			action: () => fileInput.current?.click(),
		},
	];

	return (
		<div className="overflow-hidden border border-ink/30 bg-white">
			<div className="flex flex-wrap gap-1 border-b border-ink/20 p-2">
				{buttons.map((button) => (
					<Tooltip key={button.label} title={button.label}>
						<Button
							type="text"
							icon={button.icon}
							aria-label={button.label}
							onClick={button.action}
						/>
					</Tooltip>
				))}
			</div>
			<EditorContent
				editor={editor}
				className="prose max-w-none prose-headings:font-semibold"
			/>
			<input
				ref={fileInput}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				className="hidden"
				onChange={(event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (file) addFile(file);
				}}
			/>
		</div>
	);
}
