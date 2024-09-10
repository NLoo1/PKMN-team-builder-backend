"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const { get } = require('../models/team'); // Function to fetch team details
const User = require('../models/user')


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}


/** Middleware to use when they be logged in as an admin user.
 *
 *  If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || res.locals.isAdmin=='false') {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 *
 *  If not, raises Unauthorized.
 */

async function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    
    // Check for admin role
    if (user.isAdmin) {
      return next();
    }

    // Determine if the route involves a username or a team ID
    if (req.params.username) {
      // Route involves username
      if (user.username === req.params.username) {
        return next();
      }
    } else if (req.params.id) {
      // Route involves team ID
      const team = await get(req.params.id);
      
      if (!team) {
        return next(new UnauthorizedError('Team not found'));
      }

      if (team.user_id){
        console.log(res.locals.user)
        const resp = await User.get(res.locals.user.username)
        if(resp.user_id !== team.user_id){
          return next(new UnauthorizedError)
        }
        return next();
      }
    }
    
    // If none of the conditions are met, throw UnauthorizedError
    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
};
