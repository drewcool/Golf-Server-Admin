const mongoose = require("mongoose");

const GolfCourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  image: { type: String }, 
  gallery: [{ type: String }], 
  description: { type: String }, 
  holesCount: { type: Number, default: 18 }, 

  teeDetails: [
    {
      color: { type: String, required: true }, 
      colorCode: { type: String }, 
      distanceInYards: { type: Number, required: true }, 
      manScore: { type: Number }, 
      womanScore: { type: Number }, 
      image: { type: String }, 
      par: { type: Number }, 
    },
  ],

  facilities: [{ type: String }], 

  contact: {
    phone: { type: String }, 
    email: { type: String },
    website: { type: String },
  },

  rating: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      star: { type: Number, required: true, min: 0, max: 5 },
    },
  ],
});

const GolfCourse = mongoose.model("GolfCourse", GolfCourseSchema);
module.exports = GolfCourse;
