"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import NoteEditor from "@/components/notes/NoteEditor";
import DeleteNoteButton from "@/components/notes/DeleteNoteButton";
import ShareControl from "@/components/notes/ShareControl";

type Note = {
  id: string;
  title: string;
  content: JSONContent;
  isPublic: boolean;
  publicId: string | null;
  updatedAt: string;
};

export default function NoteDetail({
  note,
  initialEditing = false,
}: {
  note: Note;
  initialEditing?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState<JSONContent>(note.content);
  const [updatedAt, setUpdatedAt] = useState(note.updatedAt);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function saveNow(nextTitle: string, nextContent: JSONContent) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setStatus("saving");
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: nextTitle || "Untitled", content: nextContent }),
    });
    if (res.ok) {
      const data = await res.json();
      setUpdatedAt(data.updatedAt);
      setStatus("saved");
    } else {
      setStatus("idle");
    }
  }

  function scheduleSave(nextTitle: string, nextContent: JSONContent) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setStatus("saving");
    saveTimeout.current = setTimeout(() => saveNow(nextTitle, nextContent), 700);
  }

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Back to Dashboard
      </Link>

      <div className="flex items-start justify-between gap-4">
        {isEditing ? (
          <input
            type="text"
            value={title}
            maxLength={200}
            onChange={(e) => {
              setTitle(e.target.value);
              scheduleSave(e.target.value, content);
            }}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-2xl font-semibold outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
          />
        ) : (
          <h1 className="text-2xl font-semibold">{title}</h1>
        )}

        <div className="flex shrink-0 gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={async () => {
                await saveNow(title, content);
                setIsEditing(false);
              }}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Save
            </button>
          )}
          <DeleteNoteButton noteId={note.id} />
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
        <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
        <span>·</span>
        <span>{note.isPublic ? "Public" : "Private"}</span>
        {isEditing && status !== "idle" && (
          <>
            <span>·</span>
            <span>{status === "saving" ? "Saving..." : "Saved"}</span>
          </>
        )}
      </div>

      <hr className="border-neutral-200 dark:border-neutral-800" />

      <NoteEditor
        content={content}
        editable={isEditing}
        onChange={(next) => {
          setContent(next);
          scheduleSave(title, next);
        }}
      />

      <ShareControl
        noteId={note.id}
        initialIsPublic={note.isPublic}
        initialPublicId={note.publicId}
      />
    </div>
  );
}
