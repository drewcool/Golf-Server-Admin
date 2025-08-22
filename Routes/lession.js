const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { addLession, getLession, saveModifiedLession, getModifiedLessions } = require("../Controllers/course/lession");
const protectUser = require("../middleWere/authUserMiddlewere");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    if (req.url === "/add-lession") {
      // Store lesson files in "uploads/lession/"
      if (file.fieldname === "video") uploadPath = "images/lession/videos/";
      if (file.fieldname === "thumbnail") uploadPath = "images/lession/images/";
    } 
    
    if (req.url === "/save-modified-lession") {
      // Store modified lesson files in "uploads/modLession/"
      if (file.fieldname === "modifiedVideo") uploadPath = "images/modLession/videos/";
      if (file.fieldname === "modifiedPhoto") uploadPath = "images/modLession/images/";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// Multer File Filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video" || file.fieldname === "modifiedVideo") {
    const videoTypes = /mp4|mov|avi|mkv/;
    if (videoTypes.test(path.extname(file.originalname).toLowerCase()) && videoTypes.test(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Only video files are allowed!"));
  }

  if (file.fieldname === "thumbnail" || file.fieldname === "modifiedPhoto") {
    const imageTypes = /jpeg|jpg|png|gif/;
    if (imageTypes.test(path.extname(file.originalname).toLowerCase()) && imageTypes.test(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Only image files are allowed!"));
  }

  cb(new Error("Invalid file type"));
};

// Initialize Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit 
});

// 🟢 Route: Add Lesson (Stored in `uploads/lession/`)
router.post("/add-lession", upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "video", maxCount: 1 }
]), addLession);

// 🟢 Route: Get Lessons
router.get("/get-lessions", getLession);

// 🟢 Route: Save Modified Lesson (Stored in `uploads/modLession/`)
router.post("/save-modified-lession", protectUser, upload.fields([
    { name: "modifiedVideo", maxCount: 1 },
    { name: "modifiedPhoto", maxCount: 1 }
]), saveModifiedLession);

// 🟢 Route: Get Modified Lessons
router.get("/get-modified-lessions", protectUser, getModifiedLessions);

module.exports = router;
