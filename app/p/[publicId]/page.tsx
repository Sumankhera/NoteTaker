import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import NoteEditor from "@/components/notes/NoteEditor";

type NoteRow = { title: string; content: string; updatedAt: string };

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  const row = db
    .query("SELECT title, content, updatedAt FROM note WHERE publicId = ? AND isPublic = 1")
    .get(publicId) as NoteRow | null;

  if (!row) notFound();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">{row.title}</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Updated: {new Date(row.updatedAt).toLocaleDateString()}
      </p>
      <hr className="border-neutral-200 dark:border-neutral-800" />
      <NoteEditor content={JSON.parse(row.content)} editable={false} />
    </main>
  );
}
