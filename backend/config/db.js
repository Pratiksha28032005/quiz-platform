const { Pool } = require('pg');
require('dotenv').config();

// Neon (and most cloud Postgres providers) require SSL, but local Postgres
// on your own machine doesn't support it by default - so we only turn SSL
// on when we're not connecting to localhost.
const isLocal = (process.env.DATABASE_URL || '').includes('localhost');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
});

module.exports = pool;
