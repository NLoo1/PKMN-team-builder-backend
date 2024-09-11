"use strict";

/** Routes for teams. 
 * @async
*/

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Team = require("../models/team");
const teamNewSchema = require("../schemas/teamNew.json");
const teamUpdateSchema = require("../schemas/teamUpdate.json");

const router = express.Router();


/** POST / { teams }  => { team }
 *
 * Creates new team
 * @returns {{Team}}
 * @requires token - user needs to be logged in
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, teamNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const team = await Team.createNew(req.body)
    return res.status(201).json({team });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { teams: [ {team_id, team_name, user_id, created_at }, ... ] }
 *
 * @returns {[Team]} - all teams
 *
 * @requires token - user needs to be logged in
 **/

router.get("/", async function (req, res, next) {
  try {
    const teams = await Team.findAll();
    return res.json( teams );
  } catch (err) {
    return next(err);
  }
});


/** GET /[team] => { team }
 *
 * @returns {{Team} }
 *
 * @requires token
 **/

router.get("/:id", async function (req, res, next) {
  try {
    const team = await Team.get(req.params.id);
    return res.json( team );
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[team] { team_name, user_id } => { team_name, user_id }
 *
 * Data can include:
 *   { team_name, user_id }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, teamUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const team = await Team.update(req.params.id, req.body);
    return res.json({ team });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[team]  =>  { deleted: team }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await Team.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
