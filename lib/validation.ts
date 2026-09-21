import { z } from "zod";

const MAX_CONTENT_BYTES = 200_000;

export const CreateNoteSchema = z.object({
  title: z.string().trim().max(200).optional(),
  content: z
    .any()
    .optional()
    .refine(
      (content) => content === undefined || JSON.stringify(content).length <= MAX_CONTENT_BYTES,
      { message: "Note content is too large" },
    ),
});
