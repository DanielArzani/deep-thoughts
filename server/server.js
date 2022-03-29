// The wrapper for our server, used for controlling responses and requests between client and server
const express = require("express");
// The wrapper that connects express and apollo so they can work together, we are de-structuring out of it, Apollo's own personal server. We do that because when express receives a request for /graphql endpoint, it will hand it over to apollo before it is returned back to express and sent with the response
const { ApolloServer } = require("apollo-server-express");
// Native node module used to aid in path-ing (e.g. windows have slightly different path names than mac, this can help in overcoming it)
const path = require("path");

// typeDefs -> Graphql requires us to specifically name the types each variable should be, the types allowed to be passed in and the types that should be returned as an output
// resolvers -> functions that control how queries sent to graphql are handled (they generate a response for a specific graphql query expression)
const { typeDefs, resolvers } = require("./schemas");
// Our authentication for allowing access to protected resources (in this case, anything a logged in user is allowed to do)
const { authMiddleware } = require("./utils/auth");
// our database configurations
const db = require("./config/connection");

// The Port number our server will run on
const PORT = process.env.PORT || 3001;
// We are creating a new instance of express (this is convention, and we use it so we don't have to type something like express().use()... I think!)
const app = express();

// We are starting our apollo server, it is an async function because ApolloServer is asynchronous and it is recommended to not let server.applyMiddleware happen before the server is started
const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware, // passing anything resolvers might need, in this authentication
  });
  await server.start();
  server.applyMiddleware({ app });
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

// we want start server to happen before our express server is running and our database is connected
startServer();

/**----------------------------------------------------------------------------------------------------
 * *                                                INFO
   When set to false, express will use the "querystring library", when set to true, it will use the "qs   library"

  querystring does not support creating nested objects from our query nor does it accept query params, it uses a flat data structure

  qs library will parse our data as nested objects and will also treat the ? in-front of something as a query


   Learn more from this link: https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0/45690436#45690436
 *----------------------------------------------------------------------------------------------------**/

// parses the incoming query as a flat data structure
app.use(express.urlencoded({ extended: false }));
// This parses (changes data from one format to another) incoming JSON requests and puts the parsed data in the req.body
app.use(express.json());

// Serve up static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
}

// once our database has been connected, start our server
db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
