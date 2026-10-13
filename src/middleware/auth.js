const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/AppError");

// Requires a valid "Authorization: Bearer <jwt>" header and sets req.userId.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new AppError(401, "Authentication required"));
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.userId = Number(payload.sub);
    next();
  } catch {
    next(new AppError(401, "Session expired, please log in again"));
  }
}

module.exports = requireAuth;
