-- DSA Sheet - MySQL schema (MySQL 8 / MariaDB 10.4+)
-- Hierarchy: chapters -> topics -> problems
-- Per-user data: user_progress (checkbox state), study_plans (calendar)

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(190)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chapters (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  title       VARCHAR(150)  NOT NULL,
  description VARCHAR(500)  NULL,
  position    INT           NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_chapters_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS topics (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  chapter_id  INT UNSIGNED  NOT NULL,
  title       VARCHAR(150)  NOT NULL,
  description VARCHAR(500)  NULL,
  difficulty  ENUM('Easy','Medium','Hard') NOT NULL DEFAULT 'Easy',
  youtube_url VARCHAR(500)  NULL,
  article_url VARCHAR(500)  NULL,
  position    INT           NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_topics_chapter (chapter_id, position),
  CONSTRAINT fk_topics_chapter FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS problems (
  id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  topic_id          INT UNSIGNED  NOT NULL,
  title             VARCHAR(200)  NOT NULL,
  difficulty        ENUM('Easy','Medium','Hard') NOT NULL,
  youtube_url       VARCHAR(500)  NULL,
  practice_url      VARCHAR(500)  NULL,
  practice_platform ENUM('LeetCode','Codeforces','Other') NOT NULL DEFAULT 'LeetCode',
  article_url       VARCHAR(500)  NULL,
  position          INT           NOT NULL DEFAULT 0,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_problems_topic (topic_id, position),
  KEY idx_problems_difficulty (difficulty),
  CONSTRAINT fk_problems_topic FOREIGN KEY (topic_id) REFERENCES topics (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_progress (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED    NOT NULL,
  problem_id   INT UNSIGNED    NOT NULL,
  is_completed TINYINT(1)      NOT NULL DEFAULT 0,
  is_revision  TINYINT(1)      NOT NULL DEFAULT 0,
  completed_at DATETIME        NULL,
  updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_progress_user_problem (user_id, problem_id),
  KEY idx_progress_user_updated (user_id, updated_at),
  KEY idx_progress_user_completed (user_id, completed_at),
  KEY idx_progress_problem (problem_id),
  CONSTRAINT fk_progress_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE CASCADE,
  CONSTRAINT fk_progress_problem FOREIGN KEY (problem_id) REFERENCES problems (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS study_plans (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          INT UNSIGNED    NOT NULL,
  title            VARCHAR(200)    NOT NULL,
  plan_date        DATE            NOT NULL,
  start_time       TIME            NULL,
  duration_minutes SMALLINT UNSIGNED NULL,
  plan_type        ENUM('learn','practice','revision','mock_test') NOT NULL DEFAULT 'practice',
  status           ENUM('pending','done','skipped') NOT NULL DEFAULT 'pending',
  topic_id         INT UNSIGNED    NULL,
  problem_id       INT UNSIGNED    NULL,
  notes            VARCHAR(1000)   NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_plans_user_date (user_id, plan_date),
  KEY idx_plans_topic (topic_id),
  KEY idx_plans_problem (problem_id),
  CONSTRAINT fk_plans_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE CASCADE,
  CONSTRAINT fk_plans_topic   FOREIGN KEY (topic_id)   REFERENCES topics (id)   ON DELETE SET NULL,
  CONSTRAINT fk_plans_problem FOREIGN KEY (problem_id) REFERENCES problems (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
