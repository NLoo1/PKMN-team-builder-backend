"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { DB_USERNAME, DB_PASSWORD, DB_NAME } = require("./config");
const { Pool } = require('pg');

// Ensure port is for PostgreSQL connection, not the application server port
const dbPort = 5432;

let db = new Client({
  user: process.env.DB_USERNAME || DB_USERNAME,
  host: 'localhost', 
  password: process.env.DB_PASSWORD || DB_PASSWORD,
  database: process.env.DB_NAME || DB_NAME,
  port: dbPort || 5432
});

db.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = db;
