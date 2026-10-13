const AppError = require("./AppError");

// Parse `data` with a zod schema, or throw a 400 with field-level details.
function parse(schema, data) {
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    throw new AppError(400, details[0]?.message || "Invalid input", details);
  }
  return result.data;
}

module.exports = { parse };
