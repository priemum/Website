const mongoose = require("mongoose");

const newreport = mongoose.Schema({
  user: String,
  clientid: String,
  date: Number,
  reason: String,
});

module.exports = mongoose.model("report_tables", newreport);
