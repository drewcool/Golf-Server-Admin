const mongoose = require('mongoose');

const driverTestSchema = new mongoose.Schema({
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
  scoring: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('DriverTest', driverTestSchema);
