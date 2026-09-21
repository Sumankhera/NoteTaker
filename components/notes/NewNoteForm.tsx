"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { JSONContent } from "@tiptap/react";
import NoteEditor from "@/components/notes/NoteEditor";

export default function NewNoteForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent>({ type: "doc", content: [] });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Couldn't save note.");
      return;
    }

    const { id } = await res.json();
    router.push(`/notes/${id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Untitled"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-lg font-medium outline-none focus:border-neutral-500"
      />

      <NoteEditor onChange={setContent} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create note"}
        </button>
      </div>
    </form>
  );
}
