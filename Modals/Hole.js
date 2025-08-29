const mongoose = require("mongoose");

const TeeBoxSchema = new mongoose.Schema({
  teeType: { type: String, required: true },
  color: { type: String, required: true },
  par: { type: Number, required: true },
  yards: { type: Number },
  meters: { type: Number },
  hcp: { type: Number },
  hex: { type: String, default: "#000000" },
  lat: { type: String, default: "" },
  lng: { type: String, default: "" }
});

const CoordinateSchema = new mongoose.Schema({
  lat: { type: String, default: "" },
  lng: { type: String, default: "" }
});

const HoleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "GolfCourse", required: true },
  courseName: { type: String, required: true },
  hole: { type: Number, required: true },
  courseHoleId: { type: String },
  par: { type: Number, default: 4 },
  hcp: { type: Number, default: 13 },
  
  // Green coordinates (optional)
  green: {
    enabled: { type: Boolean, default: false },
    coordinates: [CoordinateSchema]
  },
  
  // Water hazard (optional)
  waterHazard: {
    enabled: { type: Boolean, default: false },
    coordinates: [CoordinateSchema]
  },
  
  // Sand bunker
  sandBunker: {
    enabled: { type: Boolean, default: false },
    coordinates: [CoordinateSchema]
  },
  
  // Fairway (optional)
  fairway: {
    enabled: { type: Boolean, default: false },
    coordinates: [CoordinateSchema]
  },
  
  // Tee boxes
  teeBoxes: [TeeBoxSchema]
}, {
  timestamps: true
});

// Compound index to ensure unique holes per course
HoleSchema.index({ courseId: 1, hole: 1 }, { unique: true });

const Hole = mongoose.model("Hole", HoleSchema);
module.exports = Hole;
