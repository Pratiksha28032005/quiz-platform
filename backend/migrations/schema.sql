-- Quiz Management & Online Assessment Platform - Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('ADMIN','STUDENT')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  difficulty VARCHAR(20) DEFAULT 'BEGINNER' CHECK (difficulty IN ('BEGINNER','INTERMEDIATE','ADVANCED')),
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  passing_score INTEGER NOT NULL DEFAULT 60,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','UNPUBLISHED')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  marks INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  difficulty VARCHAR(20) DEFAULT 'BEGINNER',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS attempts (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  unanswered INTEGER DEFAULT 0,
  time_taken_seconds INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS','PASSED','FAILED')),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER REFERENCES attempts(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id INTEGER REFERENCES options(id),
  is_correct BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON answers(attempt_id);
