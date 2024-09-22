"use strict";

const request = require("supertest");
const app = require("../../app/app");  // Assuming app is the entry point of your Express app
const db = require("../../db/db"); // Assuming you have a db module
const User = require("../../app/models/user");
const { createToken } = require("../../app/helpers/tokens");

describe("POST /users", () => {
  test("admin can create a new user", async () => {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "newuser",
        password: "password123",
        email: "newuser@example.com",
        isAdmin: false
      })
      .set("authorization", `Bearer ${global.adminToken}`);

    expect(resp.statusCode).toBe(201);
    expect(resp.body).toHaveProperty("token");
    expect(resp.body.user).toHaveProperty("username", "newuser");
  });

  test("non-admin cannot create a new user", async () => {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "anotheruser",
        password: "password123",
        email: "anotheruser@example.com",
        isAdmin: false
      })
      .set("authorization", `Bearer tokentokentokentokentoken`);

    // console.log(resp)
    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /users", () => {
  test("admin can get a list of all users", async () => {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${global.adminToken}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.users).toBeInstanceOf(Array);
    expect(resp.body.users[0]).toHaveProperty("username");
  });

  test("non-admin cannot get a list of all users", async () => {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /users/:username", () => {
  test("logged-in user can view their own profile", async () => {
    const resp = await request(app)
      .get(`/users/${global.username}`)
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.user).toHaveProperty("username", global.username);
    expect(resp.body.teams).toBeInstanceOf(Array); // Assuming user teams are returned
  });

  test("admin can view another user's profile", async () => {
    const resp = await request(app)
      .get(`/users/${global.username}`)
      .set("authorization", `Bearer ${global.adminToken}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.user).toHaveProperty("username", global.username);
  });
});

describe("PATCH /users/:username", () => {
  test("user can update their own information", async () => {
    const resp = await request(app)
      .patch(`/users/${global.username}`)
      .send({ email: "updated@example.com" })
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.user).toHaveProperty("email", "updated@example.com");
  });

  test("admin can update another user's information", async () => {
    const resp = await request(app)
      .patch(`/users/${global.username}`)
      .send({ email: "adminupdated@example.com" })
      .set("authorization", `Bearer ${global.adminToken}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.user).toHaveProperty("email", "adminupdated@example.com");
  });

  test("non-admin cannot update another user's information", async () => {
    const resp = await request(app)
      .patch(`/users/admin`)
      .send({ email: "userupdate@example.com" })
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(401);
  });
});

describe("DELETE /users/:username", () => {
  test("user can delete their own account", async () => {
    const resp = await request(app)
      .delete(`/users/${global.username}`)
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty("deleted", global.username);
  });

  test("admin can delete another user's account", async () => {

    const createUser = await request(app)
    .post("/users")
    .send({
      username: "deleteuser",
      password: "password123",
      email: "newuser@example.com",
      isAdmin: false
    })
    .set("authorization", `Bearer ${global.adminToken}`);

    const resp = await request(app)
      .delete(`/users/${createUser.body.user.username}`) // User created in the POST test
      .set("authorization", `Bearer ${global.adminToken}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty("deleted", "deleteuser");
  });

  test("non-admin cannot delete another user's account", async () => {
    const resp = await request(app)
      .delete(`/users/admin`)
      .set("authorization", `Bearer ${global.token}`);

    expect(resp.statusCode).toBe(401);
  });
});
