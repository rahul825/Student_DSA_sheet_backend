const { z } = require("zod");

const email = z.string().trim().toLowerCase().email("Enter a valid email");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email,
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };
