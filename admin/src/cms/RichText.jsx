import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styles from "./Fields.module.css";

// Basic formatting only; the server keeps exactly these tags and safe links (see cleanRichText in the API).
const extensions = [
  StarterKit.configure({
    code: false,
    codeBlock: false,
    strike: false,
    heading: { levels: [2, 3] },
    link: { openOnClick: false, autolink: true, defaultProtocol: "https", protocols: ["mailto", "tel"] },
  }),
];

export default function RichText({ id, value, onChange, invalid }) {
  const editor = useEditor({
    extensions,
    content: value ?? "",
    immediatelyRender: true,
    editorProps: { attributes: { id, class: styles.prose, role: "textbox", "aria-multiline": "true", "aria-invalid": invalid ? "true" : "false" } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? null : e.getHTML()),
  });
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
    }),
  });

  const link = () => {
    const current = editor.getAttributes("link").href ?? "";
    const href = window.prompt("Link address (https://…, mailto: or tel:). Leave empty to remove the link.", current);
    if (href === null) return;
    if (!href.trim()) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  const buttons = [
    ["B", "Bold", state.bold, () => editor.chain().focus().toggleBold().run()],
    ["I", "Italic", state.italic, () => editor.chain().focus().toggleItalic().run()],
    ["U", "Underline", state.underline, () => editor.chain().focus().toggleUnderline().run()],
    ["H2", "Heading", state.h2, () => editor.chain().focus().toggleHeading({ level: 2 }).run()],
    ["H3", "Subheading", state.h3, () => editor.chain().focus().toggleHeading({ level: 3 }).run()],
    ["• List", "Bulleted list", state.bullet, () => editor.chain().focus().toggleBulletList().run()],
    ["1. List", "Numbered list", state.ordered, () => editor.chain().focus().toggleOrderedList().run()],
    ["“ ”", "Quote", state.quote, () => editor.chain().focus().toggleBlockquote().run()],
    ["Link", "Link", state.link, link],
  ];

  return (
    <div className={`${styles.rich} ${invalid ? styles.richInvalid : ""}`}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
        {buttons.map(([text, label, active, run]) => (
          <button key={label} type="button" aria-label={label} title={label} aria-pressed={active} onClick={run}>
            {text}
          </button>
        ))}
        <span className={styles.toolbarGap} />
        <button type="button" onClick={() => editor.chain().focus().undo().run()}>Undo</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}>Redo</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
