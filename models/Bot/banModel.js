const mongo = require('mongoose');

const userBans = mongo.Schema({
  caseID: {
    type: String,
  },

  reportedID: {
    type: String,
  },

  reportedByID: {
    type: String,
  },

  caseReason: {
    type: String,
  },

  caseAcceptedAt: {
    type: Date,
    default: () => new Date(),
  },

  proofLinks: {
    type: Array,
  },
});

module.exports = mongo.model('userBans', userBans);
