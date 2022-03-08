const jwt = require("jsonwebtoken");

// Probably better to put this in a config.env file since if someone can find out the secret then the jwt becomes pretty much worthless
const secret = "gjzwrrlaovhgjbypnvedpcsonkpyxqcv";
const exp = "2h";

// They need to have all 3 params correct before being logged in
// payload is the information that is being sent and it is being acquired from the functions parameters
// we then sign it to confirm that it is valid and return it back to the user to store, this will work until it expires
// sign() -> 3 args({payload}, "secret-key", [options object, callback])
module.exports = {
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign(payload, secret, { expiresIn: exp });
  },
};
