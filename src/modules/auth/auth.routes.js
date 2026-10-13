const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const requireAuth = require("../../middleware/auth");
const controller = require("./auth.controller");

const router = Router();

// Slow down brute-force attempts on login/register.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again in a few minutes" },
});

router.post("/register", authLimiter, controller.register);
router.post("/login", authLimiter, controller.login);
router.get("/me", requireAuth, controller.me);

module.exports = router;
