const { Client } = require('pg');
const db = require('./db/db');

beforeAll(async () => {
  await db.query(`
    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT false
    )
  `);
});

afterAll(async () => {
  await db.query('DROP TABLE users');
  await db.end();
});
