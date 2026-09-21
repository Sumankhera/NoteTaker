import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateNoteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = CreateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid note data" }, { status: 400 });
  }

  const { title, content } = parsed.data;
  const id = randomUUID();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO note (id, userId, title, content, isPublic, publicId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 0, NULL, ?, ?)`,
    [
      id,
      session.user.id,
      title || "Untitled",
      JSON.stringify(content ?? { type: "doc", content: [] }),
      now,
      now,
    ],
  );

  return NextResponse.json({ id }, { status: 201 });
}
