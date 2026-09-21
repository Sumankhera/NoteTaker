import Link from "next/link";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  await requireSession();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link
          href="/notes/new"
          className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
        >
          New Note
        </Link>
      </div>
    </main>
  );
}
