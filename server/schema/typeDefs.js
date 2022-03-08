// import the gql tagged template function
const { gql } = require("apollo-server-express");

//* We are specifying the expected field and its datatype as well as what kind of object should be returned
// create our typeDefs ~ Query/Mutation: ENDPOINTS/ROUTES, other types: What kind of data we want back, if it doesn't have a ! then it is optional
// user(username: String!): User -> returns a User object
// gql is a function, we are using tagged string literals in order to pass in the arguments
// Thought -> Custom data type, Query, Mutations -> Built-in data types
// (username: String) -> optional parameter
// username: String! -> Username cannot be null
const typeDefs = gql`
  type User {
    _id: ID
    username: String
    password: String
    email: String
    friendCount: Int
    thoughts: [Thought]
    friends: [User]
  }

  type Auth {
    token: ID!
    user: User
  }

  type Thought {
    _id: ID
    thoughtText: String
    createdAt: String
    username: String
    reactionCount: Int
    reactions: [Reaction]
  }

  type Reaction {
    _id: ID
    reactionBody: String
    username: String
    createdAt: String
  }

  type Query {
    me: User
    users: [User]
    user(username: String!): User
    thoughts(username: String): [Thought]
    thought(_id: ID!): Thought
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
  }
`;
// A GraphQL query retrieves data, which only accounts for one CRUD operation. But what about creating, updating, and deleting? For those operations, you can use a mutation.

// export the typeDefs
module.exports = typeDefs;
