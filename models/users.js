const mongoose = require("mongoose");

const newusers = mongoose.Schema({
    userID: String,
    staff: {type: Boolean, default: false },
    bio:String,
    website: String,
    github: String,
    voteBanned: { type: String, default: "unbanned"},
    certifiedUser: { type: Boolean, default: false }
})

module.exports = mongoose.model("users", newusers);
