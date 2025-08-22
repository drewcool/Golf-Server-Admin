const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  code: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Club type is required'],
    // enum: ['Driver', 'Wood', 'Iron', 'Wedge', 'Putter'], 
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  loft: {
    type: Number,
    required: [true, 'Loft angle is required'],
    min: 0, 
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;
