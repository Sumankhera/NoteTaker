"use client";

import { useState } from "react";

export default function ShareControl({
  noteId,
  initialIsPublic,
  initialPublicId,
  onIsPublicChange,
}: {
  noteId: string;
  initialIsPublic: boolean;
  initialPublicId: string | null;
  onIsPublicChange?: (isPublic: boolean) => void;
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [publicId, setPublicId] = useState(initialPublicId);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl =
    publicId && typeof window !== "undefined" ? `${window.location.origin}/p/${publicId}` : "";

  async function handleToggle() {
    setLoading(true);
    setCopied(false);

    if (isPublic) {
      const res = await fetch(`/api/notes/${noteId}/share`, { method: "DELETE" });
      setLoading(false);
      if (!res.ok) {
        window.alert("Couldn't stop sharing.");
        return;
      }
      setIsPublic(false);
      setPublicId(null);
      onIsPublicChange?.(false);
    } else {
      const res = await fetch(`/api/notes/${noteId}/share`, { method: "POST" });
      setLoading(false);
      if (!res.ok) {
        window.alert("Couldn't share note.");
        return;
      }
      const data = await res.json();
      setIsPublic(true);
      setPublicId(data.publicId);
      onIsPublicChange?.(true);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Public Sharing</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Anyone with the link can view this note
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          disabled={loading}
          onClick={handleToggle}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            isPublic ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-700"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              isPublic ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {isPublic && publicId && (
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="flex-1 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
