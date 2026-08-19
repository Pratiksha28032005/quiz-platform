const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Register (students only - admins are seeded/created manually per spec)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES ($1, $2, $3, 'STUDENT', 'ACTIVE')
       RETURNING id, name, email, role, status, created_at`,
      [name.trim(), normalizedEmail, hashed]
    );
    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login (works for both ADMIN and STUDENT)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    if (user.status === 'INACTIVE') {
      return res.status(403).json({ message: 'Account is deactivated' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user);
    delete user.password;
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role, status, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
  res.json(result.rows[0]);
});

module.exports = router;
