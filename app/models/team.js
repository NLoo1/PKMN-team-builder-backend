"use strict";

const db = require("../../db/db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError, BadRequestError
} = require("../middleware/expressError");


/** Related functions for teams.
 * @description - CRUD methods for Teams. 
 * @async
 */

class Team {

  /**
   * @typedef {Team}
   * @property {Integer} team_id
   * @property {String} team_name
   * @property {Integer} user_id
   */

  /** Create new team.
   *
   * @returns {Team}
   *
   * @throws {BadRequestError} on duplicates.
   **/

  static async createNew(
      { team_name, user_id}) {

        if (!team_name || !user_id) {
          throw new BadRequestError('Missing required fields');
        }

    const result = await db.query(
          `INSERT INTO teams
           (team_name, user_id)
           VALUES ($1, $2)
           RETURNING team_id, team_name, user_id`,
        [
          team_name,
          user_id
        ],
    );

    const team = result.rows[0];

    return team;
  }

  /** Find all teams.
   * @returns {Array(User)}
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT team_id,
                  team_name,
                  user_id AS "isAdmin",
                  created_at
           FROM teams
           ORDER BY team_id`,
    );

    return result.rows;
  }

  /** Find all teams for a given username.
 * 
 * @param {string} username - The username for which to find teams.
 * @returns {Array[Team]}
 **/
static async findAllTeamsByUsername(username) {
  // Find the user ID by username
  const userIdResult = await db.query(
    `SELECT user_id FROM users WHERE username = $1`, [username]
  );

  const userId = userIdResult.rows[0]?.user_id;
  
  if (!userId) {
    console.debug('Warning: no user found with this username');
    return [];
  }

  // Get all teams for the found user ID
  const teamsResult = await db.query(
    `SELECT team_id,
            team_name,
            user_id AS "isAdmin",
            created_at
     FROM teams
     WHERE user_id = $1
     ORDER BY team_id`, [userId]
  );

  // Don't throw an error if no teams are found
  if (teamsResult.rows.length <= 0) console.debug('Warning: no teams under this user');
  return teamsResult.rows;
}


  /**
   * Find a given team (by name) in a user's owned teams
   * @param {String} username 
   * @param {String} team_name 
   * @returns {Team}
   */
  static async findTeamByUser(username, team_name) {
    // Find the user id of a given username
    const user_id_res = await db.query(
      `SELECT user_id FROM users WHERE username = $1`, [username]
    );
  
    if (user_id_res.rows.length === 0) {
      throw new NotFoundError('User not found');
    }
  
    const user_id = user_id_res.rows[0].user_id;
  
    // Then get all teams under that id
    const result = await db.query(
      `SELECT team_id,
              team_name,
              user_id AS "isAdmin",
              created_at
       FROM teams
       WHERE user_id = $1 AND team_name = $2
       ORDER BY team_id`, [user_id, team_name]
    );
  
    if (result.rows.length === 0) {
      throw new NotFoundError('Warning: no team ' + team_name + ' under this user');
    }
  
    return result.rows;
  }
  

  /** 
   * Given a team id, return data about team.
   * @param {integer} team_id 
   * @returns { team_id, team_name, user_id, created_at }
   * @throws {NotFoundError} if team not found.
   **/

  static async get(team_id) {
    const userRes = await db.query(
          `SELECT team_id, team_name,
                  user_id,
                  created_at
           FROM teams
           WHERE team_id = $1`,
        [team_id],
    );

    const team = userRes.rows[0];

    if (!team) throw new NotFoundError(`No team: ${team_id}`);

    return team;
  }

/** Update team data with `data`.
 *
 * This is a "partial update" --- it's fine if data doesn't contain
 * all the fields; this only changes provided ones.
 *
 * Data can include:
 *  @param { team_id, team_name, user_id }
 *
 * @returns { team_id, team_name, user_id }
 *
 * @throws {NotFoundError} if not found.
 */

static async update(team_id, data) {
  const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        team_name: "team_name",
        user_id: "user_id"
      });
  const teamIdVarIdx = "$" + (values.length + 1);

  const querySql = `UPDATE teams 
                    SET ${setCols} 
                    WHERE team_id = ${teamIdVarIdx} 
                    RETURNING team_id,
                              team_name,
                              user_id`;
  const result = await db.query(querySql, [...values, team_id]);
  const team = result.rows[0];

  if (!team) throw new NotFoundError(`No team: ${team_id}`);

  return team;
}


  /**
   * Removes team given id
   * @param {Integer} team_id - team to remove
   * @throws {NotFoundError} if team not found
   */

  static async remove(team_id) {
    let result = await db.query(
          `DELETE
           FROM teams
           WHERE team_id = $1
           RETURNING team_id`,
        [team_id],
    );
    const team = result.rows[0];

    if (!team) throw new NotFoundError(`No team: ${team_id}`);
  }

}
module.exports = Team;
