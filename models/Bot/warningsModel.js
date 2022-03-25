const mongo = require('mongoose');

const warnings = mongo.Schema({
  userID: {
    type: String,
  },

  userName: {
    type: String,
  },

  warnedBy: {
    type: String,
  },

  warnedByName: {
    type: String,
  },

  numberOfWarns: {
    type: Number,
    default: 0,
  },

  reasonForWarn: {
    type: String,
  },

  dateOfWarn: {
    type: Date,
    default: () => new Date(),
  },

  recentlyCleared: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongo.model('warnings', warnings);
