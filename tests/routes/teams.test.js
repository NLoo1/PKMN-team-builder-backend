"use strict";

const request = require("supertest");
const app = require("../../app/app");
const db = require("../../db/db");
const User = require("../../app/models/user");
const Team = require("../../app/models/team");
const { createToken } = require("../../app/helpers/tokens");

describe("POST /teams", () => {
  it("should create a new team", async () => {
    const resp = await request(app)
      .post("/teams")
      .send({
        team_name: "New Team",
        user_id: global.user_id
      })
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(201);
    expect(resp.body.team).toHaveProperty("team_name", "New Team");
  });

  it("should fail if not logged in", async () => {
    const resp = await request(app)
      .post("/teams")
      .send({ team_name: "New Team" });

    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /teams", () => {
  it("should retrieve all teams", async () => {
    const resp = await request(app)
      .get("/teams")
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveLength(1);
    expect(resp.body[0]).toHaveProperty("team_name", "Test Team");
  });
});

describe("GET /teams/user/:id", () => {
  it("should retrieve all teams for a specific user", async () => {
    const resp = await request(app)
      .get(`/teams/user/${global.username}`)
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveLength(1);
    expect(resp.body[0]).toHaveProperty("team_name", "Test Team");
  });
});

describe("GET /teams/:id", () => {
  it("should retrieve a specific team", async () => {
    const resp = await request(app)
      .get(`/teams/${global.team_id}`)
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty("team_name", "Test Team");
  });
});

describe("PATCH /teams/:id", () => {
  it("should update a team", async () => {
    const resp = await request(app)
      .patch(`/teams/${global.team_id}`)
      .send({
        team_name: "Updated Team Name"
      })
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.team).toHaveProperty("team_name", "Updated Team Name");
  });

  it("should fail if not correct user or admin", async () => {

    const fakeToken = createToken("faketoken")

    const resp = await request(app)
      .patch(`/teams/${global.team_id}`)
      .send({
        team_name: "Updated Team Name"
      })
      .set("authorization", `Bearer ${fakeToken}`);

    //   console.log(resp)

    expect(resp.statusCode).toBe(401);
  });
});

describe("DELETE /teams/:id", () => {
  it("should delete a team", async () => {
    const resp = await request(app)
      .delete(`/teams/${global.team_id}`)
      .set("authorization", `Bearer ${global.adminToken}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ deleted: `${global.team_id}` });
  });

  it("should fail if not correct user or admin", async () => {

    const fakeToken = createToken("faketoken")
    const resp = await request(app)
      .delete(`/teams/${global.team_id}`)
      .set("authorization", `Bearer ${fakeToken}`);


    expect(resp.statusCode).toBe(401);
  });
});
