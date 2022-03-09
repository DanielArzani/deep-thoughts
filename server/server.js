// const express = require("express");
// // Import apollo server
// const { ApolloServer } = require("apollo-server-express");
// const { authMiddleware } = require("./utils/auth.js");

// // import our typeDefs and resolvers
// const { typeDefs, resolvers } = require("./schema");
// const db = require("./config/connection");

// const PORT = process.env.PORT || 3001;
// const app = express();

// const startServer = async () => {
//   // create a new Apollo server and pass in our schema data
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: authMiddleware, // This will pass authMw through all resolvers
//   });

//   // Start the Apollo server
//   await server.start();

//   // integrate our Apollo server with the Express application as middleware
//   server.applyMiddleware({ app });

//   // log where we can go to test our GQL API
//   console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
// };

// // Initialize the Apollo server
// startServer();

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// db.once("open", () => {
//   app.listen(PORT, () => {
//     console.log(`API server running on port ${PORT}!`);
//   });
// });

const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");

const { typeDefs, resolvers } = require("./schema");
const { authMiddleware } = require("./utils/auth");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;
const app = express();

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });
  await server.start();
  server.applyMiddleware({ app });
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

startServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/**-----------------------------------------------------------------------------------------
 *                          FOR CODE UNDERNEATH THIS BLOCK
 * We just added two important pieces of code that will only come into effect when we go into production. First, we check to see if the Node environment is in production. If it is, we instruct the Express.js server to serve any files in the React application's build directory in the client folder. We don't have a build folder yet—because remember, that's for production only!

The next set of functionality we created was a wildcard GET route for the server. In other words, if we make a GET request to any location on the server that doesn't have an explicit route defined, respond with the production-ready React front-end code.

 *-----------------------------------------------------------------------------------------**/

// Serve up static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// send index.html for any routes that don't exist
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
