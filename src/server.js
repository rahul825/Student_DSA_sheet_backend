const app = require("./app");
const env = require("./config/env");
const pool = require("./db/pool");

const server = app.listen(env.port, () => {
  console.log(`DSA Sheet API running on http://localhost:${env.port} (${env.nodeEnv})`);
});

// Graceful shutdown so in-flight requests finish during deploys.
function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(() => pool.end().finally(() => process.exit(0)));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
