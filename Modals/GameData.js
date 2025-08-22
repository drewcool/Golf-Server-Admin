const mongoose = require("mongoose");

const hitLocationSchema = new mongoose.Schema({
  club_id: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: false },
  club_name: { type: String, required: false },
  distance_yard: { type: Number, required: false },
  ending_lie: { type: String, required: false },
  start_point: { type: String, required: false },
  dispersion: { type: String, required: false },
  lie: { type: String, required: false },
  wind_speed: { type: Number, required: false },
  wind_direction: { type: String, required: false },
  in_between: { type: String, required: false },
  par: { type: Number, required: true },
});

const gameDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "GolfCourse", required: true },
  teeId: { type: String, required: true }, 
  hitLocations: [hitLocationSchema],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GameData", gameDataSchema);
