"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";

type HeaderUser = { id: string; name: string; email: string } | null;

export default function Header({ user }: { user: HeaderUser }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.push("/authenticate");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
          N
        </span>
        <span className="text-sm font-semibold tracking-tight">Next Notes</span>
      </Link>
      {user && (
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      )}
    </header>
  );
}
