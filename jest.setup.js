const User = require('./app/models/user');
const Team = require('./app/models/team');
const Teams_Pokemon = require('./app/models/teams_pokemon');
const db = require('./db/db');
const { createToken } = require('./app/helpers/tokens');

let testUser;
let testAdmin;
let testTeam;

beforeAll(async () => {
  // Create tables if they don't exist
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL CHECK (position('@' IN email) > 1),
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      bio TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      team_id SERIAL PRIMARY KEY,
      team_name TEXT NOT NULL,
      user_id INTEGER REFERENCES users(user_id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teams_pokemon (
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

beforeEach(async () => {
  // Generate a unique username for each test
  const uniqueSuffix = Date.now() % 1000; // Use modulo to limit size
  const username = `user_${uniqueSuffix}`; // Keep username under 25 characters

  const uniqueAdminSuffix = (Date.now() % 1000) + 1; // Use modulo to limit size
  const usernameAdmin = `admin_${uniqueSuffix}`; // Keep username under 25 characters
  
  // console.log(usernameAdmin)
  
  // Create test user, team, and Pokémon
  testUser = await User.register({
    username,
    password: 'password',
    email: `testuser_${uniqueSuffix}@example.com`,
    isAdmin: "false"
  });


  // console.log(usernameAdmin)
  // Create test admin
  testAdmin = await User.register({
    username: usernameAdmin,
    password: 'password',
    email: `testadmin_${uniqueAdminSuffix}@example.com`,
    isAdmin: "true"
  });

  testTeam = await Team.createNew({
    team_name: "Test Team",
    user_id: testUser.user_id
  });

  await Teams_Pokemon.createNew(testTeam.team_id, {
    pokemon_name: "Pikachu",
    pokemon_id: 25,
    position: 1,
    nickname: "Sparky"
  });

  global.testUser = testUser
  
  global.token = createToken(testUser)
  global.username = testUser.username
  global.user_id = testUser.user_id
  global.team_id = testTeam.team_id;

  global.testAdmin = testAdmin
  global.adminToken = createToken(testAdmin)

});

afterEach(async () => {

  await db.query("SET CONSTRAINTS ALL DEFERRED;");

  // Truncate tables and reset serial sequences
  await db.query("TRUNCATE TABLE teams_pokemon RESTART IDENTITY CASCADE;");
  await db.query("TRUNCATE TABLE teams RESTART IDENTITY CASCADE;");
  await db.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
});

afterAll(async () => {
  // Drop all tables after all tests
  await db.query(`
    DROP TABLE IF EXISTS teams_pokemon CASCADE;
    DROP TABLE IF EXISTS teams CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
});
