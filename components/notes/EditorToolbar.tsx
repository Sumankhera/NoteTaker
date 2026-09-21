"use client";

import { useEditorState, type Editor } from "@tiptap/react";

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return null;
      const e = ctx.editor;
      return {
        isParagraph: e.isActive("paragraph"),
        heading: ([1, 2, 3] as const).find((level) => e.isActive("heading", { level })) ?? null,
        isBold: e.isActive("bold"),
        isItalic: e.isActive("italic"),
        isStrike: e.isActive("strike"),
        isCode: e.isActive("code"),
        isBulletList: e.isActive("bulletList"),
        isOrderedList: e.isActive("orderedList"),
        isBlockquote: e.isActive("blockquote"),
        isCodeBlock: e.isActive("codeBlock"),
        isLink: e.isActive("link"),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      };
    },
  });

  if (!editor || !state) return null;

  function toggleLink() {
    if (!editor) return;
    if (state?.isLink) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const url = window.prompt("Link URL");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-neutral-300 bg-neutral-50 p-1.5 dark:border-neutral-700 dark:bg-neutral-900">
      <ToolbarButton title="Paragraph" active={state.isParagraph} onClick={() => editor.chain().focus().setParagraph().run()}>
        P
      </ToolbarButton>
      <ToolbarButton title="Heading 1" active={state.heading === 1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </ToolbarButton>
      <ToolbarButton title="Heading 2" active={state.heading === 2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton title="Heading 3" active={state.heading === 3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Bold" active={state.isBold} onClick={() => editor.chain().focus().toggleBold().run()} className="font-bold">
        B
      </ToolbarButton>
      <ToolbarButton title="Italic" active={state.isItalic} onClick={() => editor.chain().focus().toggleItalic().run()} className="italic">
        I
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" active={state.isStrike} onClick={() => editor.chain().focus().toggleStrike().run()} className="line-through">
        S
      </ToolbarButton>
      <ToolbarButton title="Inline code" active={state.isCode} onClick={() => editor.chain().focus().toggleCode().run()} className="font-mono">
        {"</>"}
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Bullet list" active={state.isBulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={state.isOrderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </ToolbarButton>
      <ToolbarButton title="Blockquote" active={state.isBlockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        &ldquo;
      </ToolbarButton>
      <ToolbarButton title="Code block" active={state.isCodeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="font-mono">
        {"{ }"}
      </ToolbarButton>
      <ToolbarButton title="Link" active={state.isLink} onClick={toggleLink}>
        Link
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!state.canUndo}>
        ↶
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!state.canRedo}>
        ↷
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  title,
  active,
  disabled,
  onClick,
  className = "",
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
          : "text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-neutral-300 dark:bg-neutral-700" />;
}
