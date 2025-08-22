const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'images/user/';
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath); 
  },
  filename: (req, file, cb) => {
    var ext = file.originalname.substring(file.originalname.lastIndexOf("."));
    cb(null, `${Date.now()}-Profile${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = {upload};