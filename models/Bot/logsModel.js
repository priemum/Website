const mongo = require("mongoose");

const log_settings = mongo.Schema({
  logsChannel: {
    type: String,
    default: "paradise-logs",
  },

  chatLogs: {
    type: String,
  },

  modLogs: {
    type: String,
    default: "mod-logs",
  },

  serverLogs: {
    type: String,
  },
});

module.exports = mongo.model("logs", log_settings);
