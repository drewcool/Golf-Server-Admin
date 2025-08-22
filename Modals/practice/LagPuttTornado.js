const mongoose = require('mongoose');
// Putting

const lagPuttTornadoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('LagPuttTornado', lagPuttTornadoSchema);
