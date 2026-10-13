const progressService = require("./progress.service");
const { parse } = require("../../utils/validate");
const { problemIdSchema, updateProgressSchema, tzSchema } = require("./progress.validation");

async function update(req, res) {
  const { problemId } = parse(problemIdSchema, req.params);
  const body = parse(updateProgressSchema, req.body);
  res.json(await progressService.updateProgress(req.userId, problemId, body));
}

async function summary(req, res) {
  const { tz } = parse(tzSchema, req.query);
  res.json(await progressService.getSummary(req.userId, tz));
}

module.exports = { update, summary };
