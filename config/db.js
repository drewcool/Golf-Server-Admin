const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.connect(process.env.DATABASE_URL);
    console.log('DataBase Connected');
  } catch (error) {
    console.log(error);
  }
};

module.exports = { connectDB };