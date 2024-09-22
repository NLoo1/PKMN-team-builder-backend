const db = require("../../db/db");
const { NotFoundError } = require("../../app/middleware/expressError");
const Teams_Pokemon = require("../../app/models/teams_pokemon");
const User = require("../../app/models/user");
const Team = require("../../app/models/team");


describe("Teams_Pokemon Model", () => {
  test("createNew should create and return a new Pokémon in a team", async () => {
    const teamId = global.team_id; // Assuming the team ID you want to test
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
    const teamId = global.team_id; // Assuming the team ID you want to test
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
    const teamId = global.team_id;
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
    await Teams_Pokemon.createNew( global.team_id, {pokemon_name: "Charmander", pokemon_id: 4, position: 2 } )

    await Teams_Pokemon.remove(global.team_id, "25");
    const pokemons = await Teams_Pokemon.findAll(global.team_id);
    expect(pokemons).toHaveLength(1);

  });

  test("remove should throw NotFoundError if Pokémon does not exist", async () => {
    const teamId = global.team_id;
    await expect(
      Teams_Pokemon.remove(teamId, 9999)
    ).rejects.toThrow(NotFoundError);
  });

  test("countByTeamId should return the number of Pokémon in the team", async () => {
    const teamId = global.team_id;
    const count = await Teams_Pokemon.countByTeamId(teamId, 1);
    expect(count).toBe(1);
  });
});
