// Runs schema.sql against the configured DATABASE_URL.
// Usage: npm run migrate
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
