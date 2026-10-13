const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const pool = require("./db/pool");
const requireAuth = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/error");

const authRoutes = require("./modules/auth/auth.routes");
const sheetRoutes = require("./modules/sheet/sheet.routes");
const progressRoutes = require("./modules/progress/progress.routes");
const plansRoutes = require("./modules/plans/plans.routes");

const app = express();

app.set("trust proxy", 1); // behind AWS load balancer / nginx
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "100kb" }));

// Health check for the load balancer.
app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/sheet", requireAuth, sheetRoutes);
app.use("/api/progress", requireAuth, progressRoutes);
app.use("/api/plans", requireAuth, plansRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
