// Importing necessary libraries and modules
const request = require("supertest");
const db = require("../../db/db");
const app = require("../../app/app");
const User = require("../../app/models/user");

// Mock User model methods
jest.mock("../../app/models/user");

// Sample user data
const sampleUser = {
  username: "testuser",
  password: "password123",
  email: "test@test.com",
  isAdmin: false,
  user_id: 1
};


describe("POST /auth/register", () => {
  test("successfully registers a user", async () => {
    // Mock the register method to return the new user
    User.register.mockResolvedValue(sampleUser);

    const response = await request(app)
      .post("/auth/register")
      .send({
        username: "testuser",
        password: "password123",
        email: "test@test.com"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      token: expect.any(String),
      username: "testuser",
      isAdmin: false,
      id: 1
    });
  });

  test("returns error for invalid data", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        username: "", // Invalid username
        password: "short", // Invalid password
        email: "invalid-email" // Invalid email format
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toContain("instance.username does not meet minimum length of 1");
  });
});

describe("POST /auth/token", () => {
  test("successfully logs in a user", async () => {
    // Mock the authenticate method to return the user
    User.authenticate.mockResolvedValue(sampleUser);

    const response = await request(app)
      .post("/auth/token")
      .send({
        username: "testuser",
        password: "password123"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      token: expect.any(String),
      isAdmin: false,
      id: 1,
      username: "testuser"
    });
  });

  test("returns error for incorrect login", async () => {
    // Mock authentication failure
    User.authenticate.mockResolvedValue(null);

    const response = await request(app)
      .post("/auth/token")
      .send({
        username: "wronguser",
        password: "wrongpassword"
      });

    expect(response.statusCode).toBe(500);
  });

  test("returns error for invalid request body", async () => {
    const response = await request(app)
      .post("/auth/token")
      .send({
        username: "testuser"
        // Missing password
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.message).toContain("instance requires property \"password\"");
  });
});
