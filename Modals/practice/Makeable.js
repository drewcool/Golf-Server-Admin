const mongoose = require('mongoose');
// Putting

const makeableSchema = new mongoose.Schema({
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
  },
  howToDoIt: {
    type: String,
    required: true,
  },
  scoring: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Makeable', makeableSchema);
