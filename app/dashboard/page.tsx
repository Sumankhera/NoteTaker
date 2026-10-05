import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

type NoteRow = { id: string; title: string; updatedAt: string; isPublic: number };

export default async function DashboardPage() {
  const session = await requireSession();

  const notes = db
    .query(
      "SELECT id, title, updatedAt, isPublic FROM note WHERE userId = ? ORDER BY updatedAt DESC",
    )
    .all(session.user.id) as NoteRow[];

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link
          href="/notes/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400">
            No notes yet.
            <br />
            Create your first note.
          </p>
          <Link
            href="/notes/new"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Create Note
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 px-4 py-3 dark:border-neutral-800"
            >
              <Link href={`/notes/${note.id}`} className="min-w-0 flex-1 truncate font-medium hover:underline">
                {note.title || "Untitled"}
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                <span className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {Boolean(note.isPublic) && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      Public
                    </span>
                  )}
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/notes/${note.id}?edit=1`}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
