const mongoose = require("mongoose");

const PracticeSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  video: { type: String },
  points: [{ type: String }],

  ///
  scoring: { type: String }, // scoring
  description: { type: String }, // how to do it
  description: { type: String },
///
  type: { 
    type: String, 
    enum: [
      "LagPuttTornado",
      "Makeable",
      "SimulatedPuttingRound",
      "StrokeTest",
      "UltimateChippingFairway",
      "UltimateChippingRough",
      "Survivor",
      "DriverTest",
      "Approach",
      "ApproachVariable"
    ],
    required: true
  },

  extraData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Practice", PracticeSchema);
