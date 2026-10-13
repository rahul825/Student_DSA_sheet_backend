const plansService = require("./plans.service");
const { parse } = require("../../utils/validate");
const {
  createPlanSchema,
  updatePlanSchema,
  planIdSchema,
  listPlansSchema,
  autoPlanSchema,
} = require("./plans.validation");

async function list(req, res) {
  res.json(await plansService.listPlans(req.userId, parse(listPlansSchema, req.query)));
}

async function create(req, res) {
  res.status(201).json(await plansService.createPlan(req.userId, parse(createPlanSchema, req.body)));
}

async function update(req, res) {
  const { id } = parse(planIdSchema, req.params);
  res.json(await plansService.updatePlan(req.userId, id, parse(updatePlanSchema, req.body)));
}

async function remove(req, res) {
  const { id } = parse(planIdSchema, req.params);
  await plansService.deletePlan(req.userId, id);
  res.status(204).end();
}

async function autoPlan(req, res) {
  res.status(201).json(await plansService.autoPlan(req.userId, parse(autoPlanSchema, req.body)));
}

module.exports = { list, create, update, remove, autoPlan };
