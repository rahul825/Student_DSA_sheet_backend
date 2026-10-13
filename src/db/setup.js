// Creates the database + tables and seeds the DSA sheet content (only if empty).
// Usage: npm run db:setup
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const env = require("../config/env");
const chapters = require("./seed-data");

async function main() {
  const { database, ...connOptions } = env.db;
  const conn = await mysql.createConnection({ ...connOptions, multipleStatements: true });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${database}\``);
  await conn.query(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
  console.log(`Schema ready in database "${database}"`);

  const [[{ count }]] = await conn.query("SELECT COUNT(*) AS count FROM chapters");
  if (count > 0) {
    console.log("Sheet content already seeded - skipping");
    return conn.end();
  }

  await conn.beginTransaction();
  try {
    let problemCount = 0;
    for (const [ci, chapter] of chapters.entries()) {
      const [c] = await conn.query("INSERT INTO chapters (title, description, position) VALUES (?, ?, ?)", [
        chapter.title,
        chapter.description,
        ci + 1,
      ]);
      for (const [ti, topic] of chapter.topics.entries()) {
        const [t] = await conn.query(
          `INSERT INTO topics (chapter_id, title, description, difficulty, youtube_url, article_url, position)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [c.insertId, topic.title, topic.description, topic.difficulty, topic.youtube, topic.article, ti + 1]
        );
        for (const [pi, p] of topic.problems.entries()) {
          await conn.query(
            `INSERT INTO problems (topic_id, title, difficulty, youtube_url, practice_url, practice_platform, article_url, position)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [t.insertId, p.title, p.difficulty, p.youtube, p.practice, p.platform, p.article, pi + 1]
          );
          problemCount++;
        }
      }
    }
    await conn.commit();
    console.log(`Seeded ${chapters.length} chapters and ${problemCount} problems`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Database setup failed:", err.message);
  process.exit(1);
});
