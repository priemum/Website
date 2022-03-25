const mongo = require('mongoose');

const automation_settings = mongo.Schema({
  antiSpam: {
    type: Boolean,
    default: false,
  },

  antiLinks: {
    type: Boolean,
    default: false,
  },

  antiInvite: {
    type: Boolean,
    default: false,
  },

  antiBad: {
    type: Boolean,
    default: false,
  },

  antiEveryone: {
    type: Boolean,
    default: false,
  },

  maxMentions: {
    type: Number,
  },

  maxLines: {
    type: Number,
  },

  ignoredRoles: {
    type: Array,
  },

  ignoredUsers: {
    type: Array,
  },

  ignoredChannels: {
    type: Array,
  },
});

module.exports = mongo.model('automod', automation_settings);
