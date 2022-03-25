const mongo = require("mongoose");

const bot_settings = mongo.Schema({
  guildID: {
    type: String,
  },

  prefix: {
    type: String,
    default: "p>",
  },

  paradiseOwners: {
    type: Array,
  },

  webAdmins: {
    type: Array,
  },

  serverAdmins: {
    type: Array,
  },

  checkpoint: {
    type: String,
  },

  checkpoint_logChannel: {
    type: String,
  },

  checkpoint_mode: {
    type: String,
  },

  underAttack: {
    type: Boolean,
    default: false,
  },

  nsfwDetection: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongo.model("settings", bot_settings);
