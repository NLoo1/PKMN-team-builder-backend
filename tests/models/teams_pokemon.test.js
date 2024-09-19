const db = require('../../db/db');
const { NotFoundError } = require('../../app/middleware/expressError');
const Teams_Pokemon = require('../../app/models/teams_pokemon');
const User = require('../../app/models/user');
const Team = require('../../app/models/team');

beforeAll(async () => {
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


-- Each team is under one user
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
    pokemon_name VARCHAR(50) NOT NULL, -- Assuming Pokémon names are typically short
    pokemon_id INT NOT NULL,
    position INT NOT NULL CHECK (position >= 1 AND position <= 6), -- Position in the team (1-6)
    nickname VARCHAR(50), -- Optional: If users want to give their Pokémon nicknames
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    UNIQUE (team_id, position), -- Ensure that each position in a team is unique
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

  
  
    `);
});

beforeEach(async () => {
  // Clear and initialize test data
  await db.query('TRUNCATE TABLE teams_pokemon RESTART IDENTITY CASCADE;');
  await db.query('TRUNCATE TABLE teams RESTART IDENTITY CASCADE;');
  await db.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');

  // Create test user and team
  const resultUser = await User.register({ username: 'testuser', password: 'password', email: 'testuser@example.com' });
  const userId = resultUser.id;

  const resultTeam = await Team.createNew({ name: 'Test Team', userId });
  const teamId = resultTeam.id;

  // Add a Pokémon to the team
  await Teams_Pokemon.createNew({ teamId, pokemonName: 'Pikachu' });
});

afterAll(async () => {
  // Clean up database
  await db.query('DROP TABLE IF EXISTS teams_pokemon CASCADE;');
  await db.query('DROP TABLE IF EXISTS teams CASCADE;');
  await db.query('DROP TABLE IF EXISTS users CASCADE;');

  await db.end();
});

describe('Teams_Pokemon Model', () => {
  test('createNew should create and return a new Pokémon in a team', async () => {
    const teamId = 1; // Assuming the team ID you want to test
    const pokemonName = 'Charmander'; // New Pokémon to add
    const result = await Teams_Pokemon.createNew({ teamId, pokemonName });
    expect(result.team_id).toBe(teamId);
    expect(result.pokemon_name).toBe(pokemonName);
  });

  test('createNew should throw NotFoundError for missing team', async () => {
    const invalidTeamId = 999;
    const pokemonName = 'Charmander';
    await expect(Teams_Pokemon.createNew({ teamId: invalidTeamId, pokemonName }))
      .rejects
      .toThrow(NotFoundError);
  });

  test('findAll should return all Pokémon in a team', async () => {
    const teamId = 1; // Assuming the team ID you want to test
    const pokemons = await Teams_Pokemon.findAll(teamId);
    expect(pokemons).toHaveLength(1);
    expect(pokemons[0].pokemon_name).toBe('Pikachu');
  });

  test('findAll should throw NotFoundError if no Pokémon are found', async () => {
    const invalidTeamId = 999;
    await expect(Teams_Pokemon.findAll(invalidTeamId))
      .rejects
      .toThrow(NotFoundError);
  });

  test('update should replace existing Pokémon with new ones', async () => {
    const teamId = 1;
    const newPokemonName = 'Bulbasaur'; // New Pokémon to replace Pikachu
    await Teams_Pokemon.update(teamId, [newPokemonName]);
    const pokemons = await Teams_Pokemon.findAll(teamId);
    expect(pokemons).toHaveLength(1);
    expect(pokemons[0].pokemon_name).toBe(newPokemonName);
  });

  test('remove should delete a Pokémon from the team', async () => {
    const teamId = 1;
    const pokemonName = 'Pikachu';
    await Teams_Pokemon.remove(teamId, pokemonName);
    const pokemons = await Teams_Pokemon.findAll(teamId);
    expect(pokemons).toHaveLength(0);
  });

  test('remove should throw NotFoundError if Pokémon does not exist', async () => {
    const teamId = 1;
    const invalidPokemonName = 'NonExistentPokemon';
    await expect(Teams_Pokemon.remove(teamId, invalidPokemonName))
      .rejects
      .toThrow(NotFoundError);
  });

  test('countByTeamId should return the number of Pokémon in the team', async () => {
    const teamId = 1;
    const count = await Teams_Pokemon.countByTeamId(teamId);
    expect(count).toBe(1);
  });

  test('reorderPokemons should reorder Pokémon in a team', async () => {
    const teamId = 1;
    const pokemonNames = ['Bulbasaur', 'Charmander', 'Squirtle']; // IDs of Pokémon to reorder
    await Teams_Pokemon.reorderPokemons(teamId, pokemonNames);
    const pokemons = await Teams_Pokemon.findAll(teamId);
    expect(pokemons.map(p => p.pokemon_name)).toEqual(pokemonNames);
  });
});
