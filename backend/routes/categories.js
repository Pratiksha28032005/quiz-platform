const express = require('express');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public - list categories (needed for students browsing quizzes too)
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  res.json(result.rows);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create category', error: err.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, description } = req.body;
  const result = await pool.query(
    'UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
    [name, description, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Category not found' });
  res.json(result.rows[0]);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
