const mongo = require ('mongoose');

const blacklistedUsers = mongo.Schema({
    userID: {
        type: String
    },

    adminID: {
        type: String
    },

    caseReason: {
        type: String
    },

    blacklistDate: {
        type: Date,
        default: () => new Date()
    }

});

module.exports = mongo.model("Blacklisted Users", blacklistedUsers);