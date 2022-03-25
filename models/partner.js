const mongoose = require("mongoose");
module.exports = mongoose.model(
  "partner_apps",
  mongoose.Schema({
    username: { type: String, default: "_____" },
    userID: { type: String, default: "_____" },
    what_youre_partnering: { type: String, default: "_____" },
    reason_for_partner: { type: String, default: "_____" },
    invite: { type: String, default: "_____" },
    what_you_offer: { type: String, default: "_____" },
    members: { type: String, default: "_____" },
    agreement: { type: String, default: "_____" },
  })
);
