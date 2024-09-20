// Importing necessary libraries and modules
const request = require("supertest");
const db = require("../../db/db");
const app = require("../../app/app");
const Team = require("../../app/models/team");
const { createToken } = require("../../app/helpers/tokens");

// Mocking the Team model methods
jest.mock("../../app/models/team");

// Sample user and team data
const sampleUser = {
  username: "testuser",
  user_id: 1,
  isAdmin: false
};

const sampleTeams = [
  { team_id: 1, team_name: "Team Rocket", user_id: 1, created_at: "2024-09-19T00:00:00Z" },
  { team_id: 2, team_name: "Team Aqua", user_id: 1, created_at: "2024-09-19T00:00:00Z" }
];

const sampleTeam = {
  team_id: 1,
  team_name: "Team Rocket",
  user_id: 1,
  created_at: "2024-09-19T00:00:00Z"
};

// Generating token for the sample user
const token = createToken(sampleUser);

beforeAll(async () => {
  await db.query(`
    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT false
    );
    
    CREATE TABLE teams (
      team_id SERIAL PRIMARY KEY,
      team_name TEXT UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

});

afterAll(async () => {
  await db.query("DROP TABLE teams");
  await db.query("DROP TABLE users");
});

describe("GET /teams", () => {
  test("successfully retrieves all teams for logged-in user", async () => {
    // Mock the findAllTeamsByUsername method to return sample teams
    Team.findAllTeamsByUsername.mockResolvedValue(sampleTeams);

    const response = await request(app)
      .get("/my-teams")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(sampleTeams);
  });

});

describe("GET /teams/:team_name", () => {
  test("successfully retrieves a specific team for logged-in user", async () => {
    // Mock the getTeamByUser method to return a specific team
    Team.findTeamByUser.mockResolvedValue(sampleTeam);

    const response = await request(app)
      .get("/my-teams/TeamRocket")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(sampleTeam);
  });

  test("returns 404 if team does not exist", async () => {
    // Mock the getTeamByUser method to return null (team not found)
    Team.findTeamByUser.mockResolvedValue(null);

    const response = await request(app)
      .get("/my-teams/NonExistentTeam")
      .set("Authorization", `Bearer ${token}`)

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("{\"error\":\"Team not found\"}");
  });

});
