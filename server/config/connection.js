const mongoose = require("mongoose");

// If our db is hosted on atlas, use that, if its not then connect locally and use that database or create it if it doesn't exist
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/deep-thoughts",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

module.exports = mongoose.connection;
