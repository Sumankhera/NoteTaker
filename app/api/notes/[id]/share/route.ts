import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getOwnedNote(id: string, userId: string) {
  return db.query("SELECT id FROM note WHERE id = ? AND userId = ?").get(id, userId) as
    | { id: string }
    | null;
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const note = await getOwnedNote(id, session.user.id);
  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const publicId = randomBytes(9).toString("base64url");
  const now = new Date().toISOString();

  db.run("UPDATE note SET isPublic = 1, publicId = ?, updatedAt = ? WHERE id = ?", [
    publicId,
    now,
    id,
  ]);

  return NextResponse.json({ publicId });
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

  const now = new Date().toISOString();
  db.run("UPDATE note SET isPublic = 0, publicId = NULL, updatedAt = ? WHERE id = ?", [now, id]);

  return NextResponse.json({ ok: true });
}
