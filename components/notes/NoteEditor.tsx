"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import EditorToolbar from "@/components/notes/EditorToolbar";

export default function NoteEditor({
  content,
  editable = true,
  onChange,
}: {
  content?: JSONContent;
  editable?: boolean;
  onChange?: (content: JSONContent) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content ?? { type: "doc", content: [] },
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `min-h-[16rem] px-3 py-2 text-sm leading-relaxed outline-none [&_p]:my-2 [&_h1]:mt-2 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-2 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-400 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-600 dark:[&_blockquote]:border-neutral-600 dark:[&_blockquote]:text-neutral-400 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs dark:[&_code]:bg-neutral-800 [&_pre]:rounded [&_pre]:bg-neutral-100 [&_pre]:p-2 [&_pre]:text-xs dark:[&_pre]:bg-neutral-800 [&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400 ${
          editable
            ? "rounded-b-md border border-t-0 border-neutral-300 bg-white focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
            : ""
        }`,
      },
    },
    onUpdate: editable && onChange ? ({ editor }) => onChange(editor.getJSON()) : undefined,
  }, [editable]);

  return (
    <div className="flex flex-col">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
