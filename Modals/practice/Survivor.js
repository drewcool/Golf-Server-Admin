const mongoose = require('mongoose');
// Short Game
const survivorSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Survivor', survivorSchema);
