const mongoose = require("mongoose");

const newusers = mongoose.Schema({
  user: String,
  clientid: String,
  date: Number,
  voteBanned: String,
});

module.exports = mongoose.model("vote_tables", newusers);
