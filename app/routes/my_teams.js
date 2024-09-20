"use strict";

/** Routes for user's teams.
 * @async
 */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../middleware/expressError");
const Team = require("../models/team");

const router = express.Router();

/** GET / => { my-teams: [ {team_id, team_name, user_id, created_at }, ... ] }
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
    const team = await Team.findTeamByUser(res.locals.user, req.params.team_name);

    if (!team || team === null) {
      return res.status(404).json({ error: "Team not found" }); // Proper status and JSON response
    }

    return res.json(team);
  } catch (err) {
    return next(err);
  }
});




module.exports = router;
