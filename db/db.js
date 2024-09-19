"use strict";
const { Pool } = require("pg");
const { DB_USERNAME, DB_PASSWORD, DB_NAME } = require("../config/config");

// Ensure port is for PostgreSQL connection, not the application server port
const dbPort = 5432;

const pool = new Pool({
  user: process.env.DB_USERNAME || DB_USERNAME,
  host: 'localhost',
  password: process.env.DB_PASSWORD || DB_PASSWORD,
  database: process.env.DB_NAME || DB_NAME,
  port: dbPort || 5432
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
