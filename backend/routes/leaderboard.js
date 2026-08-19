const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Overall leaderboard, ranked by average score (with quizzes-completed as tiebreaker)
router.get('/', authenticate, async (req, res) => {
  const { category_id } = req.query;
  const params = [];
  let categoryFilter = '';
  if (category_id) {
    params.push(category_id);
    categoryFilter = `AND q.category_id = $${params.length}`;
  }
  const result = await pool.query(
    `SELECT u.id AS user_id, u.name,
       ROUND(AVG(a.percentage)::numeric, 2) AS average_score,
       MAX(a.percentage) AS highest_score,
       COUNT(a.id) AS quizzes_completed
     FROM attempts a
     JOIN users u ON u.id = a.user_id
     JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.status != 'IN_PROGRESS' ${categoryFilter}
     GROUP BY u.id
     ORDER BY average_score DESC, quizzes_completed DESC
     LIMIT 50`,
    params
  );
  res.json(result.rows);
});

module.exports = router;
