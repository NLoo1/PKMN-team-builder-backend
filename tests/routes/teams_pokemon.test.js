// tests/teamsPokemonRoutes.test.js

const request = require("supertest");
const app = require("../../app/app"); 
const db = require("../../db/db");
const { createToken } = require("../../app/helpers/tokens"); 
const Teams_Pokemon = require("../../app/models/teams_pokemon");

// POST /teams_pokemon/:id - Add a Pokémon to a team
describe("POST /teams_pokemon/:id", function() {
  it("should add a Pokémon to a team", async function() {
    const resp = await request(app)
      .post(`/pokemon-teams/${global.team_id}`)
      .send({
        user_id: global.user_id,
        team_id: global.team_id,
        pokemon: [
          {
            pokemon_name: "Ivysaur",
            pokemon_id: 2,
            position: 2,
            nickname: "A Plant"
          }
        ]
      })
      .set("authorization", `Bearer ${global.token}`);
    
    expect(resp.statusCode).toBe(201);
    expect(resp.body.team).toHaveLength(1);
    expect(resp.body.team[0]).toHaveProperty("pokemon_name", "Ivysaur");
  });

  it("should return error if adding more than 6 Pokémon", async function() {

    // Insert 5 Pokémon first
    for (let i = 2; i <= 5; i++) {
      await Teams_Pokemon.createNew(global.team_id, {
        pokemon_name: `Pokemon${i}`,
        pokemon_id: i,
        position: i
      });
    }

    // Try adding a 7th Pokémon
    const resp = await request(app)
      .post(`/pokemon-teams/${global.team_id}`)
      .send({
        team_id: global.team_id,
        user_id: global.user_id,
        pokemon: [
          {
            pokemon_name: "Bulbasaur",
            pokemon_id: 1,
            position: 7
          }
        ]
      })
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(400);
    expect(resp.body.error.message).toEqual(["instance.pokemon[0].position must be less than or equal to 6"]);
  });
});

// GET /teams_pokemon/:id - Retrieve Pokémon in a team
describe("GET /teams_pokemon/:id", function() {
  it("should retrieve all Pokémon in the team", async function() {
    const resp = await request(app)
      .get(`/pokemon-teams/${global.team_id}`)
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(200);
    expect(Array.isArray(resp.body)).toBe(true);
  });
});
