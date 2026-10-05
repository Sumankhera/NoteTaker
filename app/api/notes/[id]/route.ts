import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateNoteSchema } from "@/lib/validation";

async function getOwnedNote(id: string, userId: string) {
  return db.query("SELECT id FROM note WHERE id = ? AND userId = ?").get(id, userId) as
    | { id: string }
    | null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const note = await getOwnedNote(id, session.user.id);
  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = UpdateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid note data" }, { status: 400 });
  }

  const { title, content } = parsed.data;
  const now = new Date().toISOString();

  db.run(
    `UPDATE note SET
       title = COALESCE(?, title),
       content = COALESCE(?, content),
       updatedAt = ?
     WHERE id = ?`,
    [title ?? null, content !== undefined ? JSON.stringify(content) : null, now, id],
  );

  return NextResponse.json({ updatedAt: now });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const note = await getOwnedNote(id, session.user.id);
  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  db.run("DELETE FROM note WHERE id = ?", [id]);

  return NextResponse.json({ ok: true });
}
