const mongoose = require("mongoose");

const modifiedLessionSchema = new mongoose.Schema({
  originalLessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lession",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  modifiedVideo: {
    type: String, // Store video file path or URL
    required: true,
  },
  modifiedPhoto: {
    type: String, 
    required: true,
  },
  title: {
    type: String, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ModifiedLession", modifiedLessionSchema);
