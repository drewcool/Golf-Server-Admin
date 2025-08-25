const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.DATABASE_URL;
    await mongoose.connect(mongoUri);
    console.log('DataBase Connected');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = { connectDB };