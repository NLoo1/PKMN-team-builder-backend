"use strict";
const { Pool } = require("pg");

// Use the DATABASE_URL from the environment variables, or fallback to local settings for development
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,  // Render requires this for secure connections
  },
});

// Optional: to log successful connections or errors
pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
