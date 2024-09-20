const db = require("../../db/db");
const { NotFoundError } = require("../../app/middleware/expressError");
const Teams_Pokemon = require("../../app/models/teams_pokemon");
const User = require("../../app/models/user");
const Team = require("../../app/models/team");

beforeEach(async () => {
  // Clear and initialize test data
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(25),
      password TEXT NOT NULL,
      email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      bio TEXT DEFAULT NULL
    );
    
    CREATE TABLE IF NOT EXISTS teams (
        team_id SERIAL PRIMARY KEY,
        team_name VARCHAR(100) NOT NULL,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
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

  // Create test user and team
  const resultUser = await User.register({
    username: "TEST",
    password: "password",
    email: "testuser@example.com",
    isAdmin: "false"
  });

  const resultTeam = await Team.createNew({ team_name: "Test Team", user_id: 1 });
  const teamId = resultTeam.id;

  // Add a Pokémon to the team
  await Teams_Pokemon.createNew( 1, {pokemon_name: "Pikachu", pokemon_id: 25, position: 1, nickname:"Sparky" });
});


afterEach(async () => {
  // Clean up database
  await db.query("DROP TABLE IF EXISTS teams_pokemon CASCADE;");
  await db.query("DROP TABLE IF EXISTS teams CASCADE;");
  await db.query("DROP TABLE IF EXISTS users CASCADE;");
});

describe("Teams_Pokemon Model", () => {
  test("createNew should create and return a new Pokémon in a team", async () => {
    const teamId = 1; // Assuming the team ID you want to test
    const pokemonName = "Charmander"; // New Pokémon to add
    const result = await Teams_Pokemon.createNew( teamId, {pokemon_name: "Charmander", pokemon_id: 4, position: 2 } );
    expect(result.team_id).toBe(teamId);
    expect(result.pokemon_name).toBe(pokemonName);
  });

  test("createNew should throw NotFoundError for missing team", async () => {
    const invalidTeamId = 999;
    const pokemonName = "Charmander";
    await expect(
      Teams_Pokemon.createNew( invalidTeamId, {pokemon_name: "Charmander", pokemon_id: 4, position: 2 } )
    ).rejects.toThrow(NotFoundError);
  });

  test("findAll should return all Pokémon in a team", async () => {
    const teamId = 1; // Assuming the team ID you want to test
    const pokemons = await Teams_Pokemon.findAll(teamId);
    expect(pokemons).toHaveLength(1);
    expect(pokemons[0].pokemon_name).toBe("Pikachu");
  });

  test("findAll should throw NotFoundError if no Pokémon are found", async () => {
    const invalidTeamId = 999;
    await expect(Teams_Pokemon.findAll(invalidTeamId)).rejects.toThrow(
      NotFoundError
    );
  });

  test("update should replace existing Pokémon with new ones", async () => {
    const teamId = 1;
    const newPokemonName = "Bulbasaur"; // New Pokémon to replace Pikachu
    await Teams_Pokemon.update({user_id:1, team_id: teamId, pokemon: [
      {pokemon_name: newPokemonName, pokemon_id: 1, position: 1 }
    ]});
    const pokemons = await Teams_Pokemon.findAll(teamId);
    expect(pokemons).toHaveLength(1); 
    expect(pokemons[0].pokemon_name).toBe(newPokemonName);
  });

  test("remove should delete a Pokémon from the team", async () => {

    // Add a Pokemon first to maintain team 
    await Teams_Pokemon.createNew( 1, {pokemon_name: "Charmander", pokemon_id: 4, position: 2 } )

    await Teams_Pokemon.remove(1, "25");
    const pokemons = await Teams_Pokemon.findAll(1);
    expect(pokemons).toHaveLength(1);

  });

  test("remove should throw NotFoundError if Pokémon does not exist", async () => {
    const teamId = 1;
    await expect(
      Teams_Pokemon.remove(teamId, 9999)
    ).rejects.toThrow(NotFoundError);
  });

  test("countByTeamId should return the number of Pokémon in the team", async () => {
    const teamId = 1;
    const count = await Teams_Pokemon.countByTeamId(teamId, 1);
    expect(count).toBe(1);
  });
});
