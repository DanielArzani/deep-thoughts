const { Thought, User } = require("../models/");
const { AuthenticationError } = require("apollo-server-express");
// When ever a user creates an account or logs in then a token is going to be signed by the server and sent back to them to keep
// When they want to log in they will have to send it to us and we will verify it, if it passes, we send it back and grant them access
const { signToken } = require("../utils/auth.js");

const resolvers = {
  Query: {
    // parent is a placeholder since username is the second param
    // parent: This is if we used nested resolvers to handle more complicated actions, as it would hold the reference to the resolver that executed the nested resolver function. We won't need this throughout the project, but we need to include it as the first argument.

    /**-------------------------
     *    GET ALL THOUGHTS
     *------------------------**/
    thoughts: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Thought.find(params).sort({ createdAt: -1 });
    },

    /**-------------------------
     *     GET ONE THOUGHT
     *------------------------**/
    thought: async (parent, { _id }) => {
      return Thought.findById(_id);
    },

    /**-------------------------
     *      GET ALL USERS
     *------------------------**/
    users: async (parent) => {
      return User.find()
        .select("-__v -password")
        .populate("friends")
        .populate("thoughts");
    },

    /**-------------------------
     *       GET ONE USER
     *------------------------**/
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select("-__v -password")
        .populate("friends")
        .populate("thoughts");
    },

    /**-------------------------
     * GET AUTHENTICATED USER
     *------------------------**/
    // context comes from server.js context: authMiddleware
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("thoughts")
          .populate("friends");

        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    /**-------------------------
     *       CREATE USER
     *------------------------**/
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    /**-------------------------
     *          LOGIN
     *------------------------**/
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },

    /**-------------------------
     *      CREATE THOUGHT
     *------------------------**/
    addThought: async (parent, args, context) => {
      // Check if user is logged in (see utils/auth)
      if (context.user) {
        // prettier-ignore
        const thought = await Thought.create({ ...args, username: context.user.username });

        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { thoughts: thought._id } },
          { new: true }
        );

        return thought;
      }

      throw new AuthenticationError(
        "You need to be logged in to create a thought"
      );
    },

    /**-------------------------
     *     CREATE REACTION
     *------------------------**/
    addReaction: async (parent, { thoughtId, reactionBody }, context) => {
      if (context.user) {
        const updatedThought = await Thought.findByIdAndUpdate(
          {
            _id: thoughtId,
          },
          {
            $push: {
              reactions: { reactionBody, username: context.user.username },
            },
          },
          { new: true, runValidators: true }
        );

        return updatedThought;
      }

      throw new AuthenticationError(
        "You need to be logged in to leave a reaction"
      );
    },
    /**-------------------------
     *        ADD FRIEND
     *------------------------**/
    addFriend: async (parent, { friendId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          // A user can't add the same friend twice, addToSet will prevent duplicate entries
          { $addToSet: { friends: friendId } },
          { new: true }
        );

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in to add a friend");
    },
  },
};

module.exports = resolvers;
