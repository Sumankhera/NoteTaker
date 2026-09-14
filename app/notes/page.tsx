import { requireSession } from "@/lib/session";

export default async function NotesPage() {
  await requireSession();

  return <div>Notes page</div>;
}
