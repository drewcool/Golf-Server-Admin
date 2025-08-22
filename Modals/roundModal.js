const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "GolfCourse", required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  users: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      handicap: { type: Number, required: true },
      playingHandicap: { type: Number, required: true },
      teeId: { type: mongoose.Schema.Types.ObjectId, ref: "Tee", required: true },
    },
  ],
  status: { type: String, enum: ["active", "completed"], default: "active" },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
});

module.exports = mongoose.model("Round", roundSchema);
