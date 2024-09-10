"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError");

/** 
 * Related functions for Pokemon in a team. 
 * @description A joint table between Pokemon and Team. Pokemon names are sourced from PokeAPI directly, so there is no Pokemon table.
 */

class Teams_Pokemon {

  /** Create new Pokemon in a team.
   *
   * @returns {Object} { team_id, pokemon_name, position, nickname }
   *
   * @throws {NotFoundError} if team does not exist.
   **/
  static async createNew(team_id, { pokemon_name, pokemon_id, position, nickname = '' }) {
    // Check if team already exists; throw NotFound otherwise
    const teamExists = await db.query(
      `SELECT * FROM teams WHERE team_id = $1`, [team_id]
    );
  
    if (teamExists.rows[0]) {
      const result = await db.query(
        `INSERT INTO teams_pokemon
         (team_id, pokemon_name, pokemon_id, position, nickname, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING team_id, pokemon_name, pokemon_id, position, nickname, user_id`,
        [team_id, pokemon_name, pokemon_id, position, nickname, teamExists.rows[0].user_id]
      );
  
      const team_pokemon = result.rows[0];
      return team_pokemon;
    } else {
      throw new NotFoundError(`No team: ${team_id}`);
    }
  }
  

  /** Find all team_pokemon entries.
   *
   * @description This gets all the Pokemon in a given team.
   * @param {number} team_id - Team ID to get.
   * @returns {Array} An array of Pokemon objects in the team.
   * @throws {NotFoundError} if no Pokemon are found for the team.
   **/
  static async findAll(team_id) {
    console.log(team_id)
    const results = await db.query(
      `SELECT pokemon_name, pokemon_id, position
       FROM teams_pokemon
       WHERE team_id = $1
       ORDER BY position`, [team_id]
    );

    // console.log(results.rows)

    if (results.rows.length === 0) throw new NotFoundError(`No team: ${team_id}`);
    return results.rows;
  }

  /** Update team of Pokémon with `data`.
   *
   * @param {number} teamPokemonId - The ID of the Pokemon in the team.
   * @param {Object} data - An object containing fields to update.
   * @returns {Object} The updated Pokemon object.
   * @throws {NotFoundError} if no such team Pokémon is found.
   */
  static async update(teamPokemonId, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        pokemon_id: "pokemon_id",
        team_id: "team_id",
        position: "position"
      }
    );
    const teamPokemonIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE teams_pokemon 
                      SET ${setCols} 
                      WHERE id = ${teamPokemonIdVarIdx} 
                      RETURNING id AS "teamPokemonId",
                                team_id,
                                pokemon_id,
                                position`;
    const result = await db.query(querySql, [...values, teamPokemonId]);
    const teamPokemon = result.rows[0];

    if (!teamPokemon) throw new NotFoundError(`No team Pokémon: ${teamPokemonId}`);
    return teamPokemon;
  }

  /** Delete given Pokémon from a team; returns undefined.
   *
   * @param {number} team_id - The ID of the team.
   * @param {number} pokemon_id - The ID of the Pokémon to remove.
   * @returns {undefined}
   * @throws {NotFoundError} if no such team and Pokémon combination is found.
   */
  static async remove(team_id, pokemon_id) {
    const result = await db.query(
      `DELETE
       FROM teams_pokemon
       WHERE team_id = $1 AND pokemon_id = $2
       RETURNING team_id`,
      [team_id, pokemon_id],
    );

    const teamPokemon = result.rows[0];

    if (!teamPokemon) throw new NotFoundError(`No team with ID ${team_id} containing Pokémon ID ${pokemon_id}`);
  }

  /**
   * Count the number of Pokémon in a given team.
   *
   * @param {number} teamId - The ID of the team.
   * @returns {Promise<number>} - The count of Pokémon in the team.
   */
  static async countByTeamId(teamId) {
    try {
      const result = await db.query(
        `SELECT COUNT(*) AS count FROM teams_pokemon WHERE team_id = $1`,
        [teamId]
      );
      return parseInt(result.rows[0].count, 10);
    } catch (err) {
      throw err;
    }
  }

  

  /**
   * Reorder Pokémon in a given team.
   *
   * @param {number} teamId - The ID of the team.
   * @param {Array<number>} newOrder - An array of Pokémon IDs in the new order.
   * @throws {Error} If a database error occurs.
   */
  static async reorderPokemons(teamId, newOrder) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
  
      // Clear current positions
      await client.query(
        `UPDATE teams_pokemon SET position = NULL WHERE team_id = $1`,
        [teamId]
      );
  
      // Assign new positions
      for (let i = 0; i < newOrder.length; i++) {
        await client.query(
          `UPDATE teams_pokemon SET position = $1 WHERE team_id = $2 AND pokemon_id = $3`,
          [i + 1, teamId, newOrder[i]]
        );
      }
  
      await client.query('COMMIT'); 
    } catch (err) {
      await client.query('ROLLBACK'); 
      throw err;
    } finally {
      client.release(); 
    }
  }
  

}

module.exports = Teams_Pokemon;
