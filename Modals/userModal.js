const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    dob: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: String,
    },
    loginStep: {
        type: Number,
        default: 0
    },
    handicap: {
        type: Number,
        default: 35
    },
    handPreference: {
        type: String,
        enum: ['right', 'left'],
    },
    drivingDistance: {
        type: Number,
    },
    shotShape: {
        type: String,
        enum: ['draw', 'straight', 'fade'],
    },
    commonMiss: {
        type: String,
        enum: ['right', 'left','both'],
    },
    fairwayPercentage: {
        type: Number,
        min: 0,
        max:100,
    },
    savedClubs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Club',
        default: [],
      },
      otp: String,
      otpExpiresAt: Date
}, {
    timestamps: true
});

const user = mongoose.model("User", UserSchema);

module.exports = user;