const authService = require("./auth.service");
const { parse } = require("../../utils/validate");
const { registerSchema, loginSchema } = require("./auth.validation");

async function register(req, res) {
  const result = await authService.register(parse(registerSchema, req.body));
  res.status(201).json(result);
}

async function login(req, res) {
  res.json(await authService.login(parse(loginSchema, req.body)));
}

async function me(req, res) {
  res.json({ user: await authService.getUser(req.userId) });
}

module.exports = { register, login, me };
