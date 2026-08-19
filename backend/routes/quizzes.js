const express = require('express');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// List quizzes. Students only ever see PUBLISHED quizzes; admins see everything.
router.get('/', authenticate, async (req, res) => {
  const { category, difficulty, search } = req.query;
  const conditions = [];
  const params = [];

  if (req.user.role !== 'ADMIN') {
    conditions.push(`q.status = 'PUBLISHED'`);
  }
  if (category) {
    params.push(category);
    conditions.push(`q.category_id = $${params.length}`);
  }
  if (difficulty) {
    params.push(difficulty);
    conditions.push(`q.difficulty = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`q.title ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT q.*, c.name AS category_name,
       (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) AS question_count
     FROM quizzes q
     LEFT JOIN categories c ON c.id = q.category_id
     ${where}
     ORDER BY q.created_at DESC`,
    params
  );
  res.json(result.rows);
});

router.get('/:id', authenticate, async (req, res) => {
  const result = await pool.query(
    `SELECT q.*, c.name AS category_name,
       (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) AS question_count
     FROM quizzes q LEFT JOIN categories c ON c.id = q.category_id WHERE q.id = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });
  const quiz = result.rows[0];
  if (req.user.role !== 'ADMIN' && quiz.status !== 'PUBLISHED') {
    return res.status(403).json({ message: 'Quiz is not available' });
  }
  res.json(quiz);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, category_id, difficulty, duration_minutes, passing_score, max_attempts, status } = req.body;
    if (!title || !duration_minutes) {
      return res.status(400).json({ message: 'title and duration_minutes are required' });
    }
    const result = await pool.query(
      `INSERT INTO quizzes (title, description, category_id, difficulty, duration_minutes, passing_score, max_attempts, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, description || null, category_id || null, difficulty || 'BEGINNER',
       duration_minutes, passing_score || 60, max_attempts || 1, status || 'DRAFT', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create quiz', error: err.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const fields = ['title', 'description', 'category_id', 'difficulty', 'duration_minutes', 'passing_score', 'max_attempts', 'status'];
  const updates = [];
  const params = [];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      params.push(req.body[f]);
      updates.push(`${f} = $${params.length}`);
    }
  });
  if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
  params.push(req.params.id);
  const result = await pool.query(
    `UPDATE quizzes SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });
  res.json(result.rows[0]);
});

router.patch('/:id/publish', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body; // 'PUBLISHED' | 'UNPUBLISHED' | 'DRAFT'
  const result = await pool.query(
    'UPDATE quizzes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });
  res.json(result.rows[0]);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM quizzes WHERE id = $1', [req.params.id]);
  res.json({ message: 'Quiz deleted' });
});

module.exports = router;
