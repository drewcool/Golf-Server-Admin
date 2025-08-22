const express = require("express");
const router = express.Router();
const GolfCourse = require("../Modals/GolfCourse");
const { ProfileUpload } = require("../middleWere/ProfileImageMiddlewere");
const { coursesUpload } = require("../middleWere/golfImageMiddlewere");
const { saveCourse, getSavedCourses, getCoursesWithSavedStatus, getCoursesWithSavedStatusNew } = require("../Controllers/course/caurses");
const { saveCourseHoles, getCourseHoles, deleteCourseHoles } = require("../Controllers/course/holeController");
const protectUser = require("../middleWere/authUserMiddlewere");
const protectAdmin = require("../middleWere/authAdminMiddlewere");

const uploadFields = coursesUpload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);

const uploadSingleImage = coursesUpload.single("image");


// 1. Add a Golf Course
// Add a Golf Course
router.post("/addCourse", uploadFields, async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      latitude,
      longitude,
      description,
      holesCount,
      teeDetails,
      facilities,
      contact,
    } = req.body;

    // Define the required fields
    const requiredFields = ["name", "address", "city", "state",  "description"];

    // Validate required fields
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    if (teeDetails && teeDetails.some((tee) => !tee.color || !tee.distanceInYards || !tee.manScore || !tee.womanScore)) {
      return res
        .status(400)
        .json({ message: "Each tee detail must include color, distanceInYards, manScore, and womanScore" });
    }

    // Validate file uploads
    if (!req.files || !req.files['image']) {
      return res.status(400).json({ error: "Course image is required" });
    }

    // Create a new golf course
    const newCourse = new GolfCourse({
      name,
      address,
      city,
      state,
      latitude,
      longitude,
      image: req.files['image'] ? req.files['image'][0].path : null,
      gallery: req.files['gallery'] ? req.files['gallery'].map(file => file.path) : [],
      description,
      holesCount,
      teeDetails,
      facilities,
      contact,
      rating: [],
    });
    
    console.log("Uploaded image:", req.files['image'][0]);
    console.log("Image path:", req.files['image'][0].path);

    await newCourse.save();

    res.status(201).json({status : true, message: "Golf course added successfully", course: newCourse });
  } catch (err) {
    console.error("Error adding golf course:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/addTeeDetails/:courseId", uploadSingleImage , async (req, res) => {
  try {
    console.log("Uploaded file:", req.file);
    
    const { courseId } = req.params;
    const { color, distanceInYards, manScore, womanScore , par, colorCode} = req.body;
    
    if (!color || !distanceInYards || !manScore || !womanScore) {
      return res.status(400).json({ message: "All fields (color, distanceInYards, manScore, womanScore) are required" });
    }

    const course = await GolfCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Golf course not found" });
    }

    const newTeeDetail = {
      color,
      colorCode,
      distanceInYards,
      manScore,
      womanScore,
      par,
      image: req.file ? req.file.path : null,
    };

    course.teeDetails.push(newTeeDetail);
    await course.save();

    res.status(201).json({ message: "Tee detail added successfully", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/viewCourses", protectUser, getCoursesWithSavedStatus);
router.get("/viewCoursesnew", protectUser, getCoursesWithSavedStatusNew);

router.get("/topRatedCourses", async (req, res) => {
  try {
    const courses = await GolfCourse.find();
    
    // Calculate average rating for sorting
    const coursesWithAvgRating = courses.map((course) => {
      const totalStars = course.rating.reduce((acc, curr) => acc + curr.star, 0);
      const avgRating = course.rating.length ? totalStars / course.rating.length : 0;
      return { ...course._doc, avgRating };
    });

    // Sort by average rating in descending order
    const sortedCourses = coursesWithAvgRating.sort((a, b) => b.avgRating - a.avgRating);

    res.status(200).json({ courses: sortedCourses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/addRating/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, star } = req.body;

    // Validate inputs
    if (!userId || typeof star === "undefined") {
      return res.status(400).json({ message: "User ID and star rating are required" });
    }
    if (star < 0 || star > 5) {
      return res.status(400).json({ message: "Star rating must be between 0 and 5" });
    }

    const course = await GolfCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Golf course not found" });
    }

    // Update or add the rating
    const existingRatingIndex = course.rating.findIndex((r) => r.userId.toString() === userId);
    if (existingRatingIndex !== -1) {
      // Update existing rating
      course.rating[existingRatingIndex].star = star;
    } else {
      // Add new rating
      course.rating.push({ userId, star });
    }

    await course.save();

    res.status(200).json({ message: "Rating added/updated successfully", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/getCourse/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the course by its ID and populate ratings with user details
    const course = await GolfCourse.findById(id)
      .populate({
        path: "rating.userId", // Populate user details for ratings
        select: "name email username profilePhoto", // Only fetch specific fields
      })
      .exec();

    // Check if the course exists
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Golf course retrieved successfully", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; 
  const toRad = (angle) => (Math.PI / 180) * angle;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInMeters = R * c;

  return distanceInMeters * 1.09361; 
};

router.post("/getCourse/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude || !courseId) {
      return res.status(400).json({ message: "latitude, longitude, and courseId are required" });
    }

    // Find the course by its ID
    const course = await GolfCourse.findById(courseId).populate({
      path: "rating.userId",
      select: "name email username profilePhoto",
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    
    const distanceInYards = haversineDistance(latitude, longitude, course.latitude, course.longitude);

    res.status(200).json({
      message: "Golf course retrieved successfully",
      course,
      distanceInYards: Math.round(distanceInYards),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post('/saveCourse', protectUser, saveCourse);
router.get('/getSavedCourses', protectUser, getSavedCourses);

router.get("/getSystems", async (req, res) => {
  try {
    const systems = [
      { id: 1, name: "First System" },
      { id: 2, name: "Second System" },
      { id: 3, name: "Third System" }
    ];

    res.status(200).json({ message: "Systems retrieved successfully", systems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Hole management routes
router.post("/saveHoles", saveCourseHoles);
router.get("/getHoles/:courseId", getCourseHoles);
router.delete("/deleteHoles/:courseId", deleteCourseHoles);

// Course update route
router.put("/updateCourse", uploadFields, async (req, res) => {
  try {
    const { courseId, name, address, city, state, description, holesCount, facilities, contact } = req.body;

    // Define the required fields
    const requiredFields = ["courseId", "name", "address", "city", "state", "description"];

    // Validate required fields
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ status: false, message: `${field} is required` });
      }
    }

    // Find the course to update
    const course = await GolfCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: false, message: "Golf course not found" });
    }

    // Update course fields
    course.name = name;
    course.address = address;
    course.city = city;
    course.state = state;
    course.description = description;
    course.holesCount = holesCount;
    course.facilities = facilities ? [facilities] : [];
    course.contact = contact ? { phone: contact } : {};

    // Update image if provided
    if (req.files && req.files['image'] && req.files['image'][0]) {
      course.image = req.files['image'][0].path;
    }

    // Update gallery if provided
    if (req.files && req.files['gallery'] && req.files['gallery'].length > 0) {
      course.gallery = req.files['gallery'].map(file => file.path);
    }

    await course.save();

    res.status(200).json({
      status: true,
      message: "Golf course updated successfully",
      course: course
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get course by ID route
router.get("/getCourse/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ status: false, message: "Course ID is required" });
    }

    const course = await GolfCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: false, message: "Golf course not found" });
    }

    res.status(200).json({
      status: true,
      message: "Golf course retrieved successfully",
      course: course
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
