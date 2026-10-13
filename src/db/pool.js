const mysql = require("mysql2/promise");
const env = require("../config/env");

// One shared connection pool for the whole process.
const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  queueLimit: 0,
  timezone: "Z", // JS Dates <-> MySQL DATETIME are always UTC
  dateStrings: ["DATE"], // keep calendar dates as "YYYY-MM-DD" strings
});

// Make NOW()/CURRENT_TIMESTAMP use UTC on every connection too.
pool.pool.on("connection", (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

module.exports = pool;
