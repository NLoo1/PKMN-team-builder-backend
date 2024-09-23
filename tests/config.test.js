"use strict";

require('../config/config.js');

describe("config can come from env", function () {
  test("works", function() {
    // Initial setup for non-test environment
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5000";
    process.env.DATABASE_URL = "other";

    // Load config
    const config = require("../config/config");
    expect(config.SECRET_KEY).toEqual("secret-dev");
    expect(config.PORT).toEqual(3001);
    expect(config.DATABASE_URL).toHaveProperty("database", "pokeapi_test");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(1); 

    // Cleanup and test for test environment
    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.DATABASE_URL;

})
})
