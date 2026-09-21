import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoteTaker",
  description: "A simple rich-text notes app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <Header user={session?.user ?? null} />
        {children}
      </body>
    </html>
  );
}
