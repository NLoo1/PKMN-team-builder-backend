"use strict";

/** Routes for authentication.
 * @async
 */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userNewSchema = require("../schemas/userNew.json");
const { BadRequestError } = require("../middleware/expressError");

/** POST /auth/token:  { username, password } => { token }
 * @description - Login
 *
 * @returns {{token, isAdmin}} returns token which can be used to authenticate further requests.
 *
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token, isAdmin: user.isAdmin, id: user.user_id, username: user.username});
  } catch (err) {
    return next(err);
  }
});


/**
 * @typedef {User}
 * @param {String} username
 * @param {String} password
 * @param {String} email
 */

/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, email }
 * @param {User}
 * @returns {String} - JWT token which can be used to authenticate further requests.
 * @throws {BadRequestError} if JSON request is incorrectly formatted
 * 
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token, username: newUser.username, isAdmin: newUser.isAdmin, id:newUser.user_id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
