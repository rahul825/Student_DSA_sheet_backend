const { z } = require("zod");

const problemIdSchema = z.object({ problemId: z.coerce.number().int().positive("Invalid problem id") });

const updateProgressSchema = z
  .object({
    completed: z.boolean().optional(),
    revision: z.boolean().optional(),
  })
  .refine((v) => v.completed !== undefined || v.revision !== undefined, {
    message: "Send `completed` and/or `revision`",
  });

// Offset of the user's local time from UTC, in minutes (e.g. IST = 330).
const tzSchema = z.object({ tz: z.coerce.number().int().min(-720).max(840).default(0) });

module.exports = { problemIdSchema, updateProgressSchema, tzSchema };
