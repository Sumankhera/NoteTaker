"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "@/lib/auth-client";

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.push("/authenticate");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100 text-xs font-bold text-neutral-900">
          N
        </span>
        <span className="text-sm font-semibold tracking-tight">Next Notes</span>
      </Link>
      {session && (
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      )}
    </header>
  );
}
