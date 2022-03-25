const mongo = require("mongoose");

const paradiseErrors = mongo.Schema({
  errorCode: {
    type: String,
  },

  error: {
    type: String,
  },

  errorTimestamp: {
    type: Date,
    default: () => new Date(),
  },

  errorPath: {
    type: String,
  },
});

module.exports = mongo.model("Bot Errors", paradiseErrors);
