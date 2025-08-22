const mongoose = require('mongoose');
// Putting

const simulatedRoundSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('SimulatedRound', simulatedRoundSchema);
