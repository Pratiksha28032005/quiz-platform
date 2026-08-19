// Creates a default admin account so you can log in immediately.
// Usage: node migrations/seedAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  const email = 'admin@quizplatform.com';
  const password = 'Admin@123';
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log('Admin already exists:', email);
    await pool.end();
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password, role, status) VALUES ($1,$2,$3,'ADMIN','ACTIVE')`,
    ['Admin', email, hashed]
  );
  console.log('Admin created:');
  console.log('  email:', email);
  console.log('  password:', password);
  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
