const multer = require('multer');
const path = require('path');
const { login } = require('../Controllers/UserController');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/courses/'); 
  },
  filename: (req, file, cb) => {
    var ext = file.originalname.substring(file.originalname.lastIndexOf("."));
    cb(null, `${Date.now()}-courses${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  console.log(file);
  // Check if the mimetype starts with "image/"
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'), false);
  }
};



const coursesUpload = multer({ storage, fileFilter });

module.exports = {coursesUpload};