"use client";

import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function NoteEditor({
  onChange,
}: {
  onChange: (content: JSONContent) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: { type: "doc", content: [] },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[16rem] rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm leading-relaxed outline-none focus:border-neutral-500 [&_p]:my-2 [&_h1]:mt-2 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-2 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-600 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-400 [&_code]:rounded [&_code]:bg-neutral-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return <EditorContent editor={editor} />;
}
