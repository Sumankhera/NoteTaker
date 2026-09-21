import { requireSession } from "@/lib/session";
import NewNoteForm from "@/components/notes/NewNoteForm";

export default async function NewNotePage() {
  await requireSession();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">New note</h1>
      <NewNoteForm />
    </main>
  );
}
