const express = require('express');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

router.get('/', async (req, res) => {
  const { search } = req.query;
  const params = [];
  let where = `WHERE role = 'STUDENT'`;
  if (search) {
    params.push(`%${search}%`);
    where += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`;
  }
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.status, u.created_at,
       COUNT(a.id) AS quizzes_attempted,
       COALESCE(ROUND(AVG(a.percentage)::numeric, 2), 0) AS average_score,
       COALESCE(MAX(a.percentage), 0) AS highest_score
     FROM users u
     LEFT JOIN attempts a ON a.user_id = u.id AND a.status != 'IN_PROGRESS'
     ${where}
     GROUP BY u.id ORDER BY u.created_at DESC`,
    params
  );
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const userResult = await pool.query(
    'SELECT id, name, email, status, created_at FROM users WHERE id = $1',
    [req.params.id]
  );
  if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });

  const historyResult = await pool.query(
    `SELECT a.*, q.title AS quiz_title FROM attempts a
     JOIN quizzes q ON q.id = a.quiz_id WHERE a.user_id = $1 ORDER BY a.started_at DESC`,
    [req.params.id]
  );

  res.json({ ...userResult.rows[0], history: historyResult.rows });
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body; // 'ACTIVE' | 'INACTIVE'
  const result = await pool.query(
    'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status',
    [status, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ message: 'User deleted' });
});

module.exports = router;
