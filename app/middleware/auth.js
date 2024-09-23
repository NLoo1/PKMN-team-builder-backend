"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config/config");
const { UnauthorizedError } = require("./expressError");
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
  const authHeader = req.headers && req.headers.authorization;
  // console.log("Authorization header:", authHeader); // Log auth header

  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();
    // console.log("Received token: ", token); // Log token
    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      console.log("JWT error:", err);
    }
  } else {
    console.log("No Authorization header provided");
  }
  return next();
}



/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    console.log(res.locals.user)
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
  // console.log(res.locals)
  try {
    if (res.locals.user.isAdmin==false || res.locals.user.isAdmin =='false') {
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
  // console.log("LOCALS ")
  // console.log(res.locals.user)
  try {
    const user = res.locals.user;

    console.log(user)
    
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

      if (team.user_id) {
        if (user.user_id === team.user_id) {  // Compare user_id now
          return next();
        } else {
          return next(new UnauthorizedError());
        }
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
