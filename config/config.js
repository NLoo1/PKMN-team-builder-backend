"use strict";

/** Shared config for application; can be required many places. */

const dotenvConfig = { path: process.env.NODE_ENV ? ".env." + process.env.NODE_ENV : ".env" };
require("dotenv").config(dotenvConfig);
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

// Use DATABASE_URL for production; fallback to individual settings for local development/testing
const DATABASE_URL = process.env.DATABASE_URL || {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.NODE_ENV === "test" ? "pokeapi_test" : "pokeapi",
  host: 'localhost', // Use 'localhost' for local development
  port: 5432, // PostgreSQL default port
};

const PORT = +process.env.PORT || 3001;
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

// console.log("Poke-API Config:".green);
// console.log("SECRET_KEY:".yellow, SECRET_KEY);
// console.log("PORT:".yellow, PORT.toString());
// console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
// console.log("Database:".yellow, DATABASE_URL);
// console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  DATABASE_URL,
};
