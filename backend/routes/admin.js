const express = require('express');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

// Dashboard statistics
router.get('/stats', async (req, res) => {
  const [students, quizzes, published, draft, questions, attempts, avgScore, passed, failed] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM users WHERE role = 'STUDENT'`),
    pool.query(`SELECT COUNT(*) FROM quizzes`),
    pool.query(`SELECT COUNT(*) FROM quizzes WHERE status = 'PUBLISHED'`),
    pool.query(`SELECT COUNT(*) FROM quizzes WHERE status = 'DRAFT'`),
    pool.query(`SELECT COUNT(*) FROM questions`),
    pool.query(`SELECT COUNT(*) FROM attempts WHERE status != 'IN_PROGRESS'`),
    pool.query(`SELECT COALESCE(AVG(percentage),0) AS avg FROM attempts WHERE status != 'IN_PROGRESS'`),
    pool.query(`SELECT COUNT(*) FROM attempts WHERE status = 'PASSED'`),
    pool.query(`SELECT COUNT(*) FROM attempts WHERE status = 'FAILED'`),
  ]);
  res.json({
    total_students: parseInt(students.rows[0].count, 10),
    total_quizzes: parseInt(quizzes.rows[0].count, 10),
    published_quizzes: parseInt(published.rows[0].count, 10),
    draft_quizzes: parseInt(draft.rows[0].count, 10),
    total_questions: parseInt(questions.rows[0].count, 10),
    total_attempts: parseInt(attempts.rows[0].count, 10),
    average_score: Math.round(parseFloat(avgScore.rows[0].avg) * 100) / 100,
    total_passed: parseInt(passed.rows[0].count, 10),
    total_failed: parseInt(failed.rows[0].count, 10),
  });
});

// Analytics for charts
router.get('/analytics', async (req, res) => {
  const [attemptsOverTime, registrations, popularQuizzes, popularCategories, passFail] = await Promise.all([
    pool.query(`SELECT DATE(started_at) AS date, COUNT(*) AS count FROM attempts GROUP BY DATE(started_at) ORDER BY date ASC LIMIT 30`),
    pool.query(`SELECT DATE(created_at) AS date, COUNT(*) AS count FROM users WHERE role = 'STUDENT' GROUP BY DATE(created_at) ORDER BY date ASC LIMIT 30`),
    pool.query(`SELECT q.title, COUNT(a.id) AS attempts FROM quizzes q LEFT JOIN attempts a ON a.quiz_id = q.id GROUP BY q.id ORDER BY attempts DESC LIMIT 5`),
    pool.query(`SELECT c.name, COUNT(q.id) AS quiz_count FROM categories c LEFT JOIN quizzes q ON q.category_id = c.id GROUP BY c.id ORDER BY quiz_count DESC`),
    pool.query(`SELECT status, COUNT(*) FROM attempts WHERE status != 'IN_PROGRESS' GROUP BY status`),
  ]);
  res.json({
    attempts_over_time: attemptsOverTime.rows,
    registrations_over_time: registrations.rows,
    most_popular_quizzes: popularQuizzes.rows,
    most_popular_categories: popularCategories.rows,
    pass_fail_ratio: passFail.rows,
  });
});

// All attempts (admin view)
router.get('/attempts', async (req, res) => {
  const result = await pool.query(
    `SELECT a.*, u.name AS student_name, u.email AS student_email, q.title AS quiz_title
     FROM attempts a
     JOIN users u ON u.id = a.user_id
     JOIN quizzes q ON q.id = a.quiz_id
     ORDER BY a.started_at DESC`
  );
  res.json(result.rows);
});

module.exports = router;
