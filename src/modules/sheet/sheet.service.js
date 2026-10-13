const pool = require("../../db/pool");

// Sheet content (chapters/topics/problems) is the same for every user and
// rarely changes, so it is cached in memory. Only per-user progress hits the DB.
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { data: null, expiresAt: 0 };

async function loadContent() {
  if (cache.data && cache.expiresAt > Date.now()) return cache.data;

  const [[chapters], [topics], [problems]] = await Promise.all([
    pool.query("SELECT id, title, description FROM chapters ORDER BY position, id"),
    pool.query(
      `SELECT id, chapter_id AS chapterId, title, description, difficulty,
              youtube_url AS youtubeUrl, article_url AS articleUrl
       FROM topics ORDER BY position, id`
    ),
    pool.query(
      `SELECT id, topic_id AS topicId, title, difficulty, youtube_url AS youtubeUrl,
              practice_url AS practiceUrl, practice_platform AS practicePlatform, article_url AS articleUrl
       FROM problems ORDER BY position, id`
    ),
  ]);

  const topicsById = new Map(topics.map((t) => [t.id, { ...t, problems: [] }]));
  problems.forEach((p) => topicsById.get(p.topicId)?.problems.push(p));

  const tree = chapters.map((c) => ({
    ...c,
    topics: [...topicsById.values()].filter((t) => t.chapterId === c.id),
  }));

  cache = { data: tree, expiresAt: Date.now() + CACHE_TTL_MS };
  return tree;
}

// Full sheet merged with the user's checkbox state, plus the last problem
// they touched so the UI can resume exactly where they left off.
async function getSheetForUser(userId) {
  const [content, [progressRows]] = await Promise.all([
    loadContent(),
    pool.query(
      `SELECT problem_id, is_completed, is_revision, completed_at
       FROM user_progress WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId]
    ),
  ]);

  const progress = new Map(progressRows.map((r) => [r.problem_id, r]));

  const chapters = content.map((chapter) => ({
    ...chapter,
    topics: chapter.topics.map((topic) => ({
      ...topic,
      problems: topic.problems.map((p) => {
        const row = progress.get(p.id);
        return {
          ...p,
          completed: Boolean(row?.is_completed),
          revision: Boolean(row?.is_revision),
          completedAt: row?.completed_at || null,
        };
      }),
    })),
  }));

  return { chapters, lastProblemId: progressRows[0]?.problem_id || null };
}

module.exports = { getSheetForUser };
