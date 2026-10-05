import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}));

const getSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession } },
}));

const { db } = await import("@/lib/db");
const { POST: createNote } = await import("@/app/api/notes/route");
const { PATCH: patchNote, DELETE: deleteNote } = await import("@/app/api/notes/[id]/route");
const { POST: shareNote, DELETE: unshareNote } = await import("@/app/api/notes/[id]/share/route");

function jsonRequest(body: unknown, method = "POST") {
  return new Request("http://localhost/api/notes", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function emptyRequest(method = "DELETE") {
  return new Request("http://localhost/api/notes", { method });
}

function ensureUser(id: string) {
  const now = new Date().toISOString();
  db.run(
    `INSERT OR IGNORE INTO user (id, name, email, emailVerified, createdAt, updatedAt)
     VALUES (?, ?, ?, 0, ?, ?)`,
    [id, id, `${id}@test.local`, now, now],
  );
}

async function createNoteAs(userId: string, body: Record<string, unknown> = { title: "Original" }) {
  ensureUser(userId);
  getSession.mockResolvedValue({ user: { id: userId } });
  const res = await createNote(jsonRequest(body));
  const { id } = (await res.json()) as { id: string };
  return id;
}

function getRow(id: string) {
  return db
    .query("SELECT id, userId, title, content, isPublic, publicId FROM note WHERE id = ?")
    .get(id) as
    | { id: string; userId: string; title: string; content: string; isPublic: number; publicId: string | null }
    | null;
}

beforeEach(() => {
  getSession.mockReset();
  db.run("DELETE FROM note");
});

describe("POST /api/notes", () => {
  it("rejects unauthenticated requests", async () => {
    getSession.mockResolvedValue(null);
    const res = await createNote(jsonRequest({ title: "Nope" }));
    expect(res.status).toBe(401);
  });

  it("creates a note owned by the session user", async () => {
    ensureUser("user-1");
    getSession.mockResolvedValue({ user: { id: "user-1" } });
    const res = await createNote(
      jsonRequest({ title: "Hello", content: { type: "doc", content: [] } }),
    );
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as { id: string };

    const row = getRow(id);
    expect(row?.userId).toBe("user-1");
    expect(row?.title).toBe("Hello");
    expect(row?.isPublic).toBe(0);
    expect(row?.publicId).toBeNull();
  });

  it("defaults the title to Untitled", async () => {
    ensureUser("user-1");
    getSession.mockResolvedValue({ user: { id: "user-1" } });
    const res = await createNote(jsonRequest({}));
    const { id } = (await res.json()) as { id: string };
    expect(getRow(id)?.title).toBe("Untitled");
  });

  it("rejects invalid payloads", async () => {
    ensureUser("user-1");
    getSession.mockResolvedValue({ user: { id: "user-1" } });
    const res = await createNote(jsonRequest({ title: "a".repeat(201) }));
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/notes/:id", () => {
  it("404s when the note belongs to someone else", async () => {
    const id = await createNoteAs("owner");
    getSession.mockResolvedValue({ user: { id: "intruder" } });
    const res = await patchNote(jsonRequest({ title: "Hacked" }, "PATCH"), {
      params: Promise.resolve({ id }),
    });
    expect(res.status).toBe(404);
    expect(getRow(id)?.title).toBe("Original");
  });

  it("updates title and content for the owner", async () => {
    const id = await createNoteAs("owner");
    getSession.mockResolvedValue({ user: { id: "owner" } });
    const res = await patchNote(
      jsonRequest({ title: "Updated", content: { type: "doc", content: [] } }, "PATCH"),
      { params: Promise.resolve({ id }) },
    );
    expect(res.status).toBe(200);
    expect(getRow(id)?.title).toBe("Updated");
  });

  it("404s for a note id that does not exist", async () => {
    getSession.mockResolvedValue({ user: { id: "owner" } });
    const res = await patchNote(jsonRequest({ title: "x" }, "PATCH"), {
      params: Promise.resolve({ id: "does-not-exist" }),
    });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/notes/:id", () => {
  it("404s when the note belongs to someone else", async () => {
    const id = await createNoteAs("owner");
    getSession.mockResolvedValue({ user: { id: "intruder" } });
    const res = await deleteNote(emptyRequest(), { params: Promise.resolve({ id }) });
    expect(res.status).toBe(404);
    expect(getRow(id)).not.toBeNull();
  });

  it("deletes the note for its owner", async () => {
    const id = await createNoteAs("owner");
    getSession.mockResolvedValue({ user: { id: "owner" } });
    const res = await deleteNote(emptyRequest(), { params: Promise.resolve({ id }) });
    expect(res.status).toBe(200);
    expect(getRow(id)).toBeNull();
  });
});

describe("POST/DELETE /api/notes/:id/share", () => {
  it("404s sharing a note you don't own", async () => {
    const id = await createNoteAs("owner");
    getSession.mockResolvedValue({ user: { id: "intruder" } });
    const res = await shareNote(emptyRequest("POST"), { params: Promise.resolve({ id }) });
    expect(res.status).toBe(404);
  });

  it("enables sharing with a random publicId", async () => {
    const id = await createNoteAs("owner");
    getSession.mockResolvedValue({ user: { id: "owner" } });
    const res = await shareNote(emptyRequest("POST"), { params: Promise.resolve({ id }) });
    expect(res.status).toBe(200);
    const { publicId } = (await res.json()) as { publicId: string };
    expect(publicId.length).toBeGreaterThan(0);

    const row = getRow(id);
    expect(row?.isPublic).toBe(1);
    expect(row?.publicId).toBe(publicId);
  });

  it("generates a different publicId each time", async () => {
    const id = await createNoteAs("owner");
    getSession.mockResolvedValue({ user: { id: "owner" } });
    const first = (await (await shareNote(emptyRequest("POST"), {
      params: Promise.resolve({ id }),
    })).json()) as { publicId: string };
    const second = (await (await shareNote(emptyRequest("POST"), {
      params: Promise.resolve({ id }),
    })).json()) as { publicId: string };
    expect(first.publicId).not.toBe(second.publicId);
  });

  it("stops sharing and clears the publicId", async () => {
    const id = await createNoteAs("owner");
    getSession.mockResolvedValue({ user: { id: "owner" } });
    await shareNote(emptyRequest("POST"), { params: Promise.resolve({ id }) });

    const res = await unshareNote(emptyRequest(), { params: Promise.resolve({ id }) });
    expect(res.status).toBe(200);

    const row = getRow(id);
    expect(row?.isPublic).toBe(0);
    expect(row?.publicId).toBeNull();
  });
});
