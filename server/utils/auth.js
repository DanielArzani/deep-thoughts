// const jwt = require("jsonwebtoken");

// // Probably better to put this in a config.env file since if someone can find out the secret then the jwt becomes pretty much worthless
// const secret = "gjzwrrlaovhgjbypnvedpcsonkpyxqcv";
// const exp = "90d";

// // They need to have all 3 params correct before being logged in
// // payload is the information that is being sent and it is being acquired from the functions parameters
// // we then sign it to confirm that it is valid and return it back to the user to store, this will work until it expires
// // sign() -> 3 args({payload}, "secret-key", [options object, callback])
// module.exports = {
//   signToken: function ({ username, email, _id }) {
//     const payload = { username, email, _id };

//     return jwt.sign(payload, secret, { expiresIn: exp });
//   },

//   authMiddleware: function ({ req }) {
//     // allows token to be sent via req.body, req.query, or headers
//     let token = req.body.token || req.query.token || req.headers.authorization;

//     // separate "Bearer" from "<tokenvalue>"
//     if (req.headers.authorization) {
//       console.log("original token: ", token);
//       token = token.split(" ").pop().trim();
//       console.log("token:", token);
//       console.log(typeof token);
//     }

//     // if no token, return request object as is
//     if (!token) {
//       return req;
//     }

//     try {
//       // decode and attach user data to request object
//       const { data } = jwt.verify(token, secret, { maxAge: exp });
//       req.user = data;
//     } catch {
//       console.log("Invalid token");
//     }

//     // return updated request object
//     return req;
//   },
// };

//! Goofed somewhere above

const jwt = require("jsonwebtoken");

const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
  authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log("Invalid token");
    }

    return req;
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
