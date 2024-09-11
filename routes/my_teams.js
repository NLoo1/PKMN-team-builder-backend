"use strict";

/** Routes for teams.
 * @async
 */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Team = require("../models/team");

const router = express.Router();

/** GET / => { teams: [ {team_id, team_name, user_id, created_at }, ... ] }
 *
 * @returns {[Team]} -  list of all teams under the logged in user.
 * @requires token - user needs to be logged in
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = res.locals.user.username; // Use the username of the logged-in user
    const teams = await Team.findAllTeamsByUsername(username);
    return res.json(teams);
  } catch (err) {
    return next(err);
  }
});


/** GET /[team] => { team }
 *
 * @returns {{team}}
 *
 * @requires token - user needs to be logged in
 **/

router.get("/:team_name", ensureLoggedIn, async function (req, res, next) {
  try {
    const team = await Team.getTeamByUser(res.locals.user, req.params.team_name);
    return res.json( team );
  } catch (err) {
    return next(err);
  }
});




module.exports = router;
