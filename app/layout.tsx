import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoteTaker",
  description: "A simple rich-text notes app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  );
}
