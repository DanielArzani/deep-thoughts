const { gql } = require("apollo-server-express");

const typeDefs = gql`
  # User Object, its thoughts and friends are arrays of other objects
  type User {
    _id: ID
    username: String
    email: String
    friendCount: Int
    thoughts: [Thought]
    friends: [User]
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
    createdAt: String
    username: String
  }
  # Auth object, it only contains a token which requires an ID and a User object
  type Auth {
    token: ID!
    user: User
  }
  # Query expressions, returning different objects or arrays of an object and some requiring arguments
  # If a username isn't passed into thoughts, it will return an array of all Thought Objects
  type Query {
    me: User
    users: [User]
    user(username: String!): User
    thoughts(username: String): [Thought]
    thought(_id: ID!): Thought
  }
  # Query expressions, except for manipulating data, login and addUser return an Auth object because we want the server to sign the jsonwebtoken before passing it back
  # addReaction returns a Thought object because we will not want to see a reaction by itself but what Thought is being reacted to (since Reaction is embedded into Thought, we can still see it if we query for a Thought)
  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    addThought(thoughtText: String!): Thought
    addReaction(thoughtId: ID!, reactionBody: String!): Thought
    addFriend(friendId: ID!): User
  }
`;

module.exports = typeDefs;
