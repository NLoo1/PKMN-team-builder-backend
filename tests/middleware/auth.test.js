"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../../app/middleware/expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
} = require("../../app/middleware/auth");
const { SECRET_KEY } = require("../../config/config");

const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

describe("Authentication Middleware", () => {
  describe("authenticateJWT", () => {
    const next = jest.fn();

    test("works: via header", () => {
      const req = { headers: { authorization: `Bearer ${testJwt}` } };
      const res = { locals: {} };

      authenticateJWT(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals).toEqual({
        user: {
          iat: expect.any(Number),
          username: "test",
          isAdmin: false,
        },
      });
    });

    test("works: no header", () => {
      const req = {};
      const res = { locals: {} };

      authenticateJWT(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals).toEqual({});
    });

    test("works: invalid token", () => {
      const req = { headers: { authorization: `Bearer ${badJwt}` } };
      const res = { locals: {} };

      authenticateJWT(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals).toEqual({});
    });
  });

  describe("ensureLoggedIn", () => {
    const next = jest.fn();

    test("works", () => {
      const req = {};
      const res = { locals: { user: { username: "test", isAdmin: false } } };

      ensureLoggedIn(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("unauth if no login", () => {
      const req = {};
      const res = { locals: {} };

      ensureLoggedIn(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe("ensureAdmin", () => {
    const next = jest.fn();

    test("works", () => {
      const req = {};
      const res = { locals: { user: { username: "test", isAdmin: true } } };

      ensureAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("unauth if not admin", () => {
      const req = {};
      const res = { locals: { user: { username: "test", isAdmin: false } } };

      ensureAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("unauth if anon", () => {
      const req = {};
      const res = { locals: {} };

      ensureAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe("ensureCorrectUserOrAdmin", () => {
    const next = jest.fn();

    test("works: admin", () => {
      const req = { params: { username: "test" } };
      const res = { locals: { user: { username: "admin", isAdmin: true } } };

      ensureCorrectUserOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("works: same user", () => {
      const req = { params: { username: "test" } };
      const res = { locals: { user: { username: "test", isAdmin: false } } };

      ensureCorrectUserOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("unauth: mismatch", () => {
      const req = { params: { username: "wrong" } };
      const res = { locals: { user: { username: "test", isAdmin: false } } };

      ensureCorrectUserOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("unauth: if anon", () => {
      const req = { params: { username: "test" } };
      const res = { locals: {} };

      ensureCorrectUserOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
