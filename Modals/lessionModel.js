const mongoose = require("mongoose");

const LessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  thumbnail: { type: String, required: true },
  video: { type: String, required: true },
  status: { type: Boolean, default: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Lession", LessionSchema);