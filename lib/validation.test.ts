import { describe, expect, it } from "vitest";
import { CreateNoteSchema, UpdateNoteSchema } from "@/lib/validation";

describe("CreateNoteSchema", () => {
  it("accepts an empty payload", () => {
    expect(CreateNoteSchema.safeParse({}).success).toBe(true);
  });

  it("trims whitespace from the title", () => {
    const result = CreateNoteSchema.safeParse({ title: "  hello  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("hello");
  });

  it("rejects titles over 200 characters", () => {
    const result = CreateNoteSchema.safeParse({ title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("accepts titles at exactly 200 characters", () => {
    const result = CreateNoteSchema.safeParse({ title: "a".repeat(200) });
    expect(result.success).toBe(true);
  });

  it("accepts arbitrary JSON content", () => {
    const result = CreateNoteSchema.safeParse({
      content: { type: "doc", content: [{ type: "paragraph", content: [] }] },
    });
    expect(result.success).toBe(true);
  });

  it("rejects content over the size limit", () => {
    const result = CreateNoteSchema.safeParse({
      content: { type: "doc", text: "a".repeat(200_001) },
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateNoteSchema", () => {
  it("is the same shape as CreateNoteSchema", () => {
    expect(UpdateNoteSchema).toBe(CreateNoteSchema);
  });
});
