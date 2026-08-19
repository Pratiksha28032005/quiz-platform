# Quiz Management & Online Assessment Platform

Full-stack MVP: Node.js/Express + PostgreSQL backend, React + Vite + Tailwind frontend.
Covers all core spec features: auth, admin/student roles, quiz & question CRUD,
categories, quiz attempt flow with countdown timer, backend-validated scoring,
results with answer review, dashboards, attempt history, and leaderboard.

## 1. Setup PostgreSQL

Create the database:
```
psql -U postgres -c "CREATE DATABASE quiz_platform;"
```

## 2. Backend

```
cd backend
npm install
cp .env.example .env
```
Edit `.env` and set `DATABASE_URL` to your local Postgres credentials, and set a `JWT_SECRET`.

Create the tables:
```
npm run migrate
```

Create a default admin login (admin@quizplatform.com / Admin@123):
```
node migrations/seedAdmin.js
```

Start the API (http://localhost:5001):
```
npm run dev
```

## 3. Frontend

In a second terminal:
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 — Vite proxies `/api` calls to the backend automatically.

## 4. Try it out

1. Log in as admin (admin@quizplatform.com / Admin@123).
2. Go to Categories → add a category (e.g. "JavaScript").
3. Go to Quizzes → create a quiz, set it to PUBLISHED (or create as Draft then click Publish).
4. Open the quiz → Questions → add a few questions with 4 options each, marking the correct one.
5. Register a new student account (or log out and go to /register).
6. As the student, browse quizzes, start one, answer, watch the timer, and submit.
7. Check the result/review page, student dashboard, attempt history, and leaderboard.

## Project structure

```
backend/
  server.js            entry point
  config/db.js          Postgres pool
  middleware/auth.js     JWT auth + role guards
  routes/                auth, categories, quizzes, questions, attempts, admin, users, leaderboard
  migrations/schema.sql  DB schema (matches section 20 of the spec)
frontend/
  src/pages/              one file per screen (quiz list, attempt, results, admin panels, etc.)
  src/context/AuthContext  login/register/logout + token storage
  src/api/axios.js         pre-configured axios instance (auto-attaches JWT)
```

## Notes on what's implemented vs. spec

- All of sections 3–19 (roles, dashboards, quiz/question/category management, quiz attempt,
  timer, submission, results, leaderboard) are implemented end-to-end.
- Scoring, pass/fail, and time-taken are always computed server-side (see `routes/attempts.js`)
  — the frontend never sends a score, matching the "Important Rule" in section 27.
- Section 26 "Advanced Features" (certificates, email notifications, CSV question import,
  dark mode, negative marking, question/option randomization, quiz scheduling) are NOT
  implemented — they're explicitly marked as optional/future enhancements in the spec, so
  they're good candidates to mention as "future work" in your submission or add afterward
  if you have time.
- Security basics from section 27 included: bcrypt password hashing, JWT auth, role-based
  route guards, parameterized SQL (no injection risk), and backend score validation.
  Rate limiting and CSRF protection are not included — mention as future work if asked.
