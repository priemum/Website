const mongoose = require("mongoose");
module.exports = mongoose.model("staff_apps", mongoose.Schema({
    username: { type: String, default: "_____"},
    userID: { type: String, default: "_____"},
    experience: { type: String, default: "_____"},
    position: { type: String, default: "_____"},
    reason: { type: String, default: "_____"},
    strength: { type: String, default: "_____"},
    handle: { type: String, default: "_____"},
    rules: { type: String, default: "_____"},
    trial: { type: String, default: "_____"},
    development: { type: String, default: "_____"},
    kinda: { type: String, default: "_____"},
    tos: { type: String, default: "_____"},
}));
