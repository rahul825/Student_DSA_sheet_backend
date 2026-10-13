const pool = require("../../db/pool");
const AppError = require("../../utils/AppError");
const { addDays, todayInTz } = require("../../utils/date");

// Upsert one checkbox state. Only the fields that are sent are changed.
async function updateProgress(userId, problemId, { completed, revision }) {
  const [problem] = await pool.query("SELECT id FROM problems WHERE id = ?", [problemId]);
  if (!problem.length) throw new AppError(404, "Problem not found");

  const [rows] = await pool.query(
    "SELECT is_completed, is_revision, completed_at FROM user_progress WHERE user_id = ? AND problem_id = ?",
    [userId, problemId]
  );
  const prev = rows[0] || { is_completed: 0, is_revision: 0, completed_at: null };

  const isCompleted = completed ?? Boolean(prev.is_completed);
  const isRevision = revision ?? Boolean(prev.is_revision);
  // Keep the original completion time if it was already completed.
  const completedAt = isCompleted ? (prev.is_completed ? prev.completed_at : new Date()) : null;

  await pool.query(
    `INSERT INTO user_progress (user_id, problem_id, is_completed, is_revision, completed_at, updated_at)
     VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())
     ON DUPLICATE KEY UPDATE
       is_completed = VALUES(is_completed),
       is_revision  = VALUES(is_revision),
       completed_at = VALUES(completed_at),
       updated_at   = UTC_TIMESTAMP()`,
    [userId, problemId, isCompleted, isRevision, completedAt]
  );

  return { problemId, completed: isCompleted, revision: isRevision, completedAt };
}

// Current streak = consecutive days (ending today or yesterday) with at least one solved problem.
function computeStreak(days, today) {
  const solved = new Set(days);
  let cursor = solved.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (solved.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

async function getSummary(userId, tz) {
  const [[byDifficulty], [byChapter], [[revision]], [lastRows], [nextRows], [dayRows]] = await Promise.all([
    pool.query(
      `SELECT p.difficulty, COUNT(*) AS total, COALESCE(SUM(up.is_completed), 0) AS completed
       FROM problems p
       LEFT JOIN user_progress up ON up.problem_id = p.id AND up.user_id = ?
       GROUP BY p.difficulty`,
      [userId]
    ),
    pool.query(
      `SELECT c.id, c.title, COUNT(p.id) AS total, COALESCE(SUM(up.is_completed), 0) AS completed
       FROM chapters c
       JOIN topics t ON t.chapter_id = c.id
       JOIN problems p ON p.topic_id = t.id
       LEFT JOIN user_progress up ON up.problem_id = p.id AND up.user_id = ?
       GROUP BY c.id, c.title, c.position
       ORDER BY c.position, c.id`,
      [userId]
    ),
    pool.query("SELECT COUNT(*) AS count FROM user_progress WHERE user_id = ? AND is_revision = 1", [userId]),
    // Last problem the user interacted with -> "continue where you left off".
    pool.query(
      `SELECT p.id, p.title, p.difficulty, p.practice_url AS practiceUrl, t.title AS topicTitle,
              c.title AS chapterTitle, up.is_completed AS completed, up.updated_at AS updatedAt
       FROM user_progress up
       JOIN problems p ON p.id = up.problem_id
       JOIN topics t ON t.id = p.topic_id
       JOIN chapters c ON c.id = t.chapter_id
       WHERE up.user_id = ?
       ORDER BY up.updated_at DESC LIMIT 1`,
      [userId]
    ),
    // First unsolved problem in sheet order -> "up next".
    pool.query(
      `SELECT p.id, p.title, p.difficulty, p.practice_url AS practiceUrl, t.title AS topicTitle, c.title AS chapterTitle
       FROM problems p
       JOIN topics t ON t.id = p.topic_id
       JOIN chapters c ON c.id = t.chapter_id
       LEFT JOIN user_progress up ON up.problem_id = p.id AND up.user_id = ?
       WHERE up.is_completed IS NULL OR up.is_completed = 0
       ORDER BY c.position, t.position, p.position
       LIMIT 1`,
      [userId]
    ),
    pool.query(
      `SELECT DISTINCT DATE(DATE_ADD(completed_at, INTERVAL ? MINUTE)) AS day
       FROM user_progress
       WHERE user_id = ? AND is_completed = 1
       ORDER BY day DESC LIMIT 400`,
      [tz, userId]
    ),
  ]);

  const difficulty = {
    Easy: { total: 0, completed: 0 },
    Medium: { total: 0, completed: 0 },
    Hard: { total: 0, completed: 0 },
  };
  byDifficulty.forEach((r) => (difficulty[r.difficulty] = { total: Number(r.total), completed: Number(r.completed) }));
  const levels = Object.values(difficulty);

  return {
    total: levels.reduce((sum, d) => sum + d.total, 0),
    completed: levels.reduce((sum, d) => sum + d.completed, 0),
    difficulty,
    chapters: byChapter.map((c) => ({ id: c.id, title: c.title, total: Number(c.total), completed: Number(c.completed) })),
    revisionCount: Number(revision.count),
    streak: computeStreak(
      dayRows.map((r) => r.day),
      todayInTz(tz)
    ),
    lastProblem: lastRows[0] ? { ...lastRows[0], completed: Boolean(lastRows[0].completed) } : null,
    nextProblem: nextRows[0] || null,
  };
}

module.exports = { updateProgress, getSummary };
