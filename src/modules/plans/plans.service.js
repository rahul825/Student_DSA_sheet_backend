const pool = require("../../db/pool");
const AppError = require("../../utils/AppError");
const { addDays, isWeekend } = require("../../utils/date");
const progressService = require("../progress/progress.service");

const PLAN_SELECT = `
  SELECT sp.id, sp.title, sp.plan_date AS planDate, TIME_FORMAT(sp.start_time, '%H:%i') AS startTime,
         sp.duration_minutes AS durationMinutes, sp.plan_type AS planType, sp.status, sp.notes,
         sp.topic_id AS topicId, t.title AS topicTitle,
         sp.problem_id AS problemId, p.title AS problemTitle, p.difficulty AS problemDifficulty,
         p.practice_url AS practiceUrl
  FROM study_plans sp
  LEFT JOIN topics t ON t.id = sp.topic_id
  LEFT JOIN problems p ON p.id = sp.problem_id`;

// API field -> DB column for create/update.
const COLUMNS = {
  title: "title",
  planDate: "plan_date",
  startTime: "start_time",
  durationMinutes: "duration_minutes",
  planType: "plan_type",
  status: "status",
  topicId: "topic_id",
  problemId: "problem_id",
  notes: "notes",
};

// Convert a local calendar day to the UTC instant at which it starts.
const localDayStartUtc = (dateStr, tz) => new Date(Date.parse(`${dateStr}T00:00:00Z`) - tz * 60000);

// Calendar data for a date range: the user's plans + problems they solved each day.
async function listPlans(userId, { from, to, tz }) {
  const [[plans], [solved]] = await Promise.all([
    pool.query(
      `${PLAN_SELECT}
       WHERE sp.user_id = ? AND sp.plan_date BETWEEN ? AND ?
       ORDER BY sp.plan_date, sp.start_time IS NULL, sp.start_time, sp.id`,
      [userId, from, to]
    ),
    pool.query(
      `SELECT DATE(DATE_ADD(up.completed_at, INTERVAL ? MINUTE)) AS date, p.id AS problemId, p.title,
              p.difficulty, p.practice_url AS practiceUrl, up.is_revision AS revision
       FROM user_progress up
       JOIN problems p ON p.id = up.problem_id
       WHERE up.user_id = ? AND up.is_completed = 1 AND up.completed_at >= ? AND up.completed_at < ?
       ORDER BY up.completed_at`,
      [tz, userId, localDayStartUtc(from, tz), localDayStartUtc(addDays(to, 1), tz)]
    ),
  ]);

  return { plans, solved: solved.map((s) => ({ ...s, revision: Boolean(s.revision) })) };
}

async function getPlan(userId, planId) {
  const [rows] = await pool.query(`${PLAN_SELECT} WHERE sp.id = ? AND sp.user_id = ?`, [planId, userId]);
  if (!rows.length) throw new AppError(404, "Plan not found");
  return rows[0];
}

async function createPlan(userId, data) {
  const fields = Object.keys(data).filter((key) => COLUMNS[key] && data[key] !== undefined);
  const [result] = await pool.query(
    `INSERT INTO study_plans (user_id, ${fields.map((f) => COLUMNS[f]).join(", ")})
     VALUES (?, ${fields.map(() => "?").join(", ")})`,
    [userId, ...fields.map((f) => data[f])]
  );
  return getPlan(userId, result.insertId);
}

async function updatePlan(userId, planId, data) {
  const existing = await getPlan(userId, planId);

  const fields = Object.keys(data).filter((key) => COLUMNS[key] && data[key] !== undefined);
  await pool.query(
    `UPDATE study_plans SET ${fields.map((f) => `${COLUMNS[f]} = ?`).join(", ")} WHERE id = ? AND user_id = ?`,
    [...fields.map((f) => data[f]), planId, userId]
  );

  // Finishing a plan that is linked to a problem ticks that problem in the sheet.
  const problemId = data.problemId !== undefined ? data.problemId : existing.problemId;
  if (data.status === "done" && existing.status !== "done" && problemId) {
    await progressService.updateProgress(userId, problemId, { completed: true });
  }

  return getPlan(userId, planId);
}

async function deletePlan(userId, planId) {
  const [result] = await pool.query("DELETE FROM study_plans WHERE id = ? AND user_id = ?", [planId, userId]);
  if (!result.affectedRows) throw new AppError(404, "Plan not found");
}

// Spread the next unsolved (and not already planned) problems over the coming days.
async function autoPlan(userId, { startDate, perDay, days, chapterId, includeWeekends }) {
  const [problems] = await pool.query(
    `SELECT p.id, p.title, p.topic_id AS topicId
     FROM problems p
     JOIN topics t ON t.id = p.topic_id
     JOIN chapters c ON c.id = t.chapter_id
     LEFT JOIN user_progress up ON up.problem_id = p.id AND up.user_id = ?
     WHERE (up.is_completed IS NULL OR up.is_completed = 0)
       AND (? IS NULL OR c.id = ?)
       AND NOT EXISTS (
         SELECT 1 FROM study_plans sp
         WHERE sp.user_id = ? AND sp.problem_id = p.id AND sp.status = 'pending'
       )
     ORDER BY c.position, t.position, p.position
     LIMIT ?`,
    [userId, chapterId ?? null, chapterId ?? null, userId, perDay * days]
  );

  if (!problems.length) return { created: 0, from: null, to: null };

  const rows = [];
  let date = startDate;
  for (let i = 0; i < problems.length; i += perDay) {
    while (!includeWeekends && isWeekend(date)) date = addDays(date, 1);
    for (const p of problems.slice(i, i + perDay)) {
      rows.push([userId, `Solve: ${p.title}`, date, "practice", p.topicId, p.id]);
    }
    date = addDays(date, 1);
  }

  await pool.query(
    "INSERT INTO study_plans (user_id, title, plan_date, plan_type, topic_id, problem_id) VALUES ?",
    [rows]
  );
  return { created: rows.length, from: rows[0][2], to: rows[rows.length - 1][2] };
}

module.exports = { listPlans, getPlan, createPlan, updatePlan, deletePlan, autoPlan };
