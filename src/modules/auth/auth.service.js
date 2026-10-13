const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../db/pool");
const env = require("../../config/env");
const AppError = require("../../utils/AppError");

const toUser = (row) => ({ id: row.id, name: row.name, email: row.email, createdAt: row.created_at });

const signToken = (userId) => jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

async function register({ name, email, password }) {
  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) throw new AppError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [
    name,
    email,
    passwordHash,
  ]);
  const user = await getUser(result.insertId);
  return { user, token: signToken(user.id) };
}

async function login({ email, password }) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  const row = rows[0];
  // Same message for unknown email and wrong password, so emails cannot be enumerated.
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    throw new AppError(401, "Invalid email or password");
  }
  return { user: toUser(row), token: signToken(row.id) };
}

async function getUser(userId) {
  const [rows] = await pool.query("SELECT id, name, email, created_at FROM users WHERE id = ?", [userId]);
  if (!rows.length) throw new AppError(401, "User no longer exists");
  return toUser(rows[0]);
}

module.exports = { register, login, getUser };
