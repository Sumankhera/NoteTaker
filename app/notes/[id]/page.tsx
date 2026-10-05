import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import NoteDetail from "@/components/notes/NoteDetail";

type NoteRow = {
  id: string;
  title: string;
  content: string;
  isPublic: number;
  publicId: string | null;
  updatedAt: string;
};

export default async function NoteEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const { edit } = await searchParams;

  const row = db
    .query("SELECT id, title, content, isPublic, publicId, updatedAt FROM note WHERE id = ? AND userId = ?")
    .get(id, session.user.id) as NoteRow | null;

  if (!row) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <NoteDetail
        note={{
          id: row.id,
          title: row.title,
          content: JSON.parse(row.content),
          isPublic: Boolean(row.isPublic),
          publicId: row.publicId,
          updatedAt: row.updatedAt,
        }}
        initialEditing={edit === "1"}
      />
    </main>
  );
}
