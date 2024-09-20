const { Client } = require("pg");
const db = require("./db/db");

beforeEach(async () => {
  // Setup database schema for tests
  await db.query(`
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(25),
  password TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bio TEXT DEFAULT NULL
);


CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE teams_pokemon (
    id SERIAL PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    pokemon_name VARCHAR(50) NOT NULL, 
    pokemon_id INT NOT NULL,
    position INT NOT NULL CHECK (position >= 1 AND position <= 6),
    nickname VARCHAR(50),
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    UNIQUE (team_id, position), 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


    `);
});

afterEach(async () => {
  await db.query("DROP TABLE IF EXISTS users CASCADE  ");
  await db.query("DROP TABLE IF EXISTS teams  CASCADE");
  await db.query("DROP TABLE IF EXISTS teams_pokemon  CASCADE");
  await db.end();
});
