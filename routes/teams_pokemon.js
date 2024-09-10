"use strict";

/** Routes for teams_pokemon. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Teams_Pokemon = require("../models/teams_pokemon");
const teamsPokemonNew = require("../schemas/teams_pokemonNew.json");
const teamsPokemonUpdate = require("../schemas/teams_pokemonEdit.json");

const router = express.Router();

/** POST / { user-teams }  => { user, team }
 *
 * Add a new Pokemon to a given team
 * 
 * @requires token - admin or relevant user
 * @throws {BadRequestError} if trying to add more than 6 Pokemon or invalid request
 **/
router.post("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    // Validate request body against schema
    const validator = jsonschema.validate(req.body, teamsPokemonNew);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    // Check if adding a new Pokémon would exceed the limit
    const currentCount = await Teams_Pokemon.countByTeamId(req.params.id);
    if (currentCount >= 6) {
      throw new BadRequestError("Team cannot exceed 6 Pokémon.");
    }

    // Add new Pokémon to the team
    const promises = req.body.pokemon.map(pkmn => 
      Teams_Pokemon.createNew(req.params.id, pkmn)
    );

    const team = await Promise.all(promises); // Handle multiple Pokémon

    // Returning this doesn't matter that much; as long as teams_pokemon is populated
    return res.status(201).json({ team });
  } catch (err) {
    return next(err);
  }
});

  

/** GET / => { pkmn: [ ... ] }
 *
 * @returns {pkmn: [...]} - All Pokemon in a given team
 *
 **/

router.get("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const pkmn = await Teams_Pokemon.findAll(req.params.id);
    // console.log(pkmn)
    return res.json(pkmn)
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[user-teams] { team } => { team }
 *
 * @requires token - admin privileges or same user
 * @throws {BadRequestError} - if invalid request
 **/

router.patch("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, teamsPokemonUpdate);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      // Handle Pokémon reordering
      if (req.body.newOrder) {
        await Teams_Pokemon.reorderPokemons(req.params.id, req.body.newOrder);
      } else {
        const pkmn = await Teams_Pokemon.update(req.params.id, req.body);
        return res.json({ pkmn });
      }
  
    } catch (err) {
      return next(err);
    }
  });
  

/** DELETE /[user-teams]  =>  { deleted: pkmn }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await Teams_Pokemon.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /teams/:id/reorder
 *
 * Reorder Pokémon in a team
 **/
router.patch('/:id/reorder', ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
      const { newOrder } = req.body; // Assume newOrder is an array of Pokémon IDs in the new order
  
      // Validate newOrder array
      if (!Array.isArray(newOrder) || newOrder.length === 0) {
        throw new BadRequestError('Invalid Pokémon order.');
      }
  
      await Teams_Pokemon.reorderPokemons(req.params.id, newOrder);
      return res.status(200).json({ message: 'Pokémon reordered successfully.' });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;
