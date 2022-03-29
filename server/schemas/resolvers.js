// An Error Class provided by Apollo
const { AuthenticationError } = require("apollo-server-express");
// Thought and User models
const { User, Thought } = require("../models");
// function for signing tokens once a user has created an account or logged in
const { signToken } = require("../utils/auth");

// our responses for specific graphql queries
const resolvers = {
  //
  Query: {
    /**-------------------------
     * GET AUTHENTICATED USER
     *------------------------**/
    /**---------------------------------------------------------------------------------
     * *                                INFO
     *   If user is logged in (jwt has been verified)
     *   Find a document in the User collection with the matching _id
     *   Prevent version and password fields form appearing on query
     *   Populate thoughts and friends arrays on query
     *   If user is not logged in or credentials fail or jwt has expired, throw new error
     *---------------------------------------------------------------------------------**/
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

    /**-------------------------
     *      GET ALL USERS
     *------------------------**/
    /**---------------------------------------------------------------------------
     * *                                INFO
     *  Query all documents within User collection
     *  Hide ver and password from query
     *  Populate thoughts and friends array
     *---------------------------------------------------------------------------**/
    users: async () => {
      return User.find()
        .select("-__v -password")
        .populate("thoughts")
        .populate("friends");
    },

    /**-------------------------
     *       GET ONE USER
     *------------------------**/
    /**---------------------------------------------------------------------------
     * *                                INFO
     *  Query through User collection and find document with matching username,
        the username is passed in from the req.body (args)
     *  Hide/populate fields
     *---------------------------------------------------------------------------**/
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select("-__v -password")
        .populate("friends")
        .populate("thoughts");
    },

    /**-------------------------
     *     GET ONE THOUGHT
     *------------------------**/
    /**---------------------------------------------------------------------------
     * *                                INFO
     *  Query through Thought collection and return all documents unless a specific
        username is passed in as an argument
     *  Sort by createdAt date in descending order (newest to oldest)
     *---------------------------------------------------------------------------**/
    thoughts: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Thought.find(params).sort({ createdAt: -1 });
    },

    /**-------------------------
     *     GET ONE THOUGHT
     *------------------------**/
    /**---------------------------------------------------------------------------
     * *                                INFO
     *  Query through Though collection and find a document with the matching _id
     *---------------------------------------------------------------------------**/
    thought: async (parent, { _id }) => {
      return Thought.findOne({ _id });
    },
  },

  Mutation: {
    /**-------------------------
     *       CREATE USER
     *------------------------**/
    /**---------------------------------------------------------------------------
     * *                                INFO
     *  Add a new document to the user Collection by using the information passed
        in through the args (request object)
     *  Sign the jwt(use our secret and encrypt it)
     *  Pass it back to the client through the response object
       (where its get stored in local storage)
     *---------------------------------------------------------------------------**/
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    /**-------------------------
     *          LOGIN
     *------------------------**/
    /**---------------------------------------------------------------------------
     * *                                INFO
     *  Check to see if a document with the matching email exists
     *  Check to see if the password given is correct
     *  Sign the jwt and pass it to the client
     *---------------------------------------------------------------------------**/
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
    /**---------------------------------------------------------------------------
     * *                                INFO
     *  Check if a currently logged in user exists
     *  Unpack the given key/value pairs and set the username as the currently
        logged in users username
     *  Find a User document with the matching id
     *  Push the ID of the new Thought document into the thoughts array of the 
        User document
     *  Return the updated document instead of the previous one
     *---------------------------------------------------------------------------**/
    addThought: async (parent, args, context) => {
      if (context.user) {
        const thought = await Thought.create({
          ...args,
          username: context.user.username,
        });

        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { thoughts: thought._id } },
          { new: true }
        );

        return thought;
      }

      throw new AuthenticationError("You need to be logged in!");
    },

    /**-------------------------
     *     CREATE REACTION
     *------------------------**/
    /**---------------------------------------------------------------------------------
     * *                                INFO
     *  Check if a logged in user is sending this request
     *  Find a document with the matching thoughtId in order to update it
     *  Push the new reaction and the username of who posted it into the reactions array
     *  Return the new document and run the validators on update
     *----------------------------------------------------------------------------------**/
    addReaction: async (parent, { thoughtId, reactionBody }, context) => {
      if (context.user) {
        const updatedThought = await Thought.findOneAndUpdate(
          { _id: thoughtId },
          {
            $push: {
              reactions: { reactionBody, username: context.user.username },
            },
          },
          { new: true, runValidators: true }
        );

        return updatedThought;
      }

      throw new AuthenticationError("You need to be logged in!");
    },

    /**-------------------------
     *        ADD FRIEND
     *------------------------**/
    /**---------------------------------------------------------------------------
     * *                                INFO
     *  Check if logged in user is sending this request
     *  Update the User document which has the matching _id as the logged in user
     *  Use addToSet in order to ensure that the friend being added is unique
     *  Return updated document
     *---------------------------------------------------------------------------**/
    addFriend: async (parent, { friendId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { friends: friendId } },
          { new: true }
        ).populate("friends");

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
