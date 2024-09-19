"use strict";

/** Express app for Pokemon Team Builder. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./middleware/expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const teamRoutes = require("./routes/teams")
const userTeamRoutes = require("./routes/my_teams") // Like teamRoutes, but specific to logged in user
const teamPokemonRoutes = require("./routes/teams_pokemon") // For modifying Pokemon in a team

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/teams", teamRoutes);
app.use('/pokemon-teams', teamPokemonRoutes)

// Specific to a logged in user
app.use("/my-teams", userTeamRoutes);


/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
