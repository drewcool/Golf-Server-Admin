const mongoose = require('mongoose');

const savedCourseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'GolfCourse', required: true },
  savedAt: { type: Date, default: Date.now },
});

const SavedCourse = mongoose.model('SavedCourse', savedCourseSchema);
module.exports = SavedCourse;
