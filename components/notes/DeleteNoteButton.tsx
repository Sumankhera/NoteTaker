"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;

    setDeleting(true);
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      window.alert("Couldn't delete note.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
