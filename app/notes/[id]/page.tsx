import { requireSession } from "@/lib/session";

export default async function NoteEditorPage() {
  await requireSession();

  return <div>Note editor page</div>;
}
