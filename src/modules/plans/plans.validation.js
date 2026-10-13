const { z } = require("zod");

const PLAN_TYPES = ["learn", "practice", "revision", "mock_test"];
const STATUSES = ["pending", "done", "skipped"];

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM");
const id = z.number().int().positive();
const tz = z.coerce.number().int().min(-720).max(840).default(0);

const planFields = {
  title: z.string().trim().min(1, "Title is required").max(200),
  planDate: date,
  startTime: time.nullable().optional(),
  durationMinutes: z.number().int().min(5).max(720).nullable().optional(),
  planType: z.enum(PLAN_TYPES),
  topicId: id.nullable().optional(),
  problemId: id.nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
};

const createPlanSchema = z.object({ ...planFields, planType: planFields.planType.default("practice") });

const updatePlanSchema = z
  .object({ ...planFields, status: z.enum(STATUSES) })
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });

const planIdSchema = z.object({ id: z.coerce.number().int().positive("Invalid plan id") });

const DAY_MS = 24 * 60 * 60 * 1000;
const listPlansSchema = z
  .object({ from: date, to: date, tz })
  .refine((v) => v.from <= v.to, { message: "`from` must be before `to`" })
  .refine((v) => (Date.parse(v.to) - Date.parse(v.from)) / DAY_MS <= 100, { message: "Range can be at most 100 days" });

const autoPlanSchema = z.object({
  startDate: date,
  perDay: z.number().int().min(1).max(10),
  days: z.number().int().min(1).max(60),
  chapterId: id.nullable().optional(),
  includeWeekends: z.boolean().default(true),
});

module.exports = { createPlanSchema, updatePlanSchema, planIdSchema, listPlansSchema, autoPlanSchema };
