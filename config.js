"use strict";

/** Shared config for application; can be required many places. */

const dotenvConfig = { path: process.env.NODE_ENV ? ".env." + process.env.NODE_ENV : ".env" }
require("dotenv").config(dotenvConfig)
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD 
const DB_NAME = process.env.DB_NAME
const PORT = +process.env.PORT || 3001;

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Poke-API Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, DB_NAME);
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME
};
