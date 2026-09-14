import { requireSession } from "@/lib/session";

export default async function NewNotePage() {
  await requireSession();

  return <div>New note page</div>;
}
