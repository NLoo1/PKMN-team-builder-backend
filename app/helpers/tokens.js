const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config/config");

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(user.isAdmin !== undefined,
      "createToken passed user without isAdmin property");

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
    user_id: user.user_id // Include user_id in the token payload
  };

  return jwt.sign(payload, SECRET_KEY);
}


module.exports = { createToken };
