const GolfCourse = require("../../Modals/GolfCourse");
const SavedCourse = require("../../Modals/SavedCourseModel");
const asyncHandler = require('express-async-handler');

const getCoursesWithSavedStatus = async (req, res) => {
    try {
      const userId = req.user._id; 
  
      // Fetch all golf courses
      const courses = await GolfCourse.find();
  
      if (courses.length === 0) {
        return res.status(404).json({ message: "No golf courses found" });
      }
  
      // Fetch the user's saved courses
      const savedCourses = await SavedCourse.find({ user: userId }).select('course');
      const savedCourseIds = savedCourses.map((saved) => saved.course.toString());
  
      // Add the isSaved field to each course
      const coursesWithSavedStatus = courses.map((course) => ({
        ...course.toObject(),
        isSaved: savedCourseIds.includes(course._id.toString()),
      }));
  
      res.status(200).json({ courses: coursesWithSavedStatus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };

  const getCoursesWithSavedStatusNew = async (req, res) => {
    try {
        const userId = req.user._id;
        const { Latitude, Longitude } = req.query; // Get user location from request

        if (!Latitude || !Longitude) {
            return res.status(400).json({ message: "User location (latitude & longitude) is required" });
        }

        // Convert user location to numbers
        const userLat = parseFloat(Latitude);
        const userLon = parseFloat(Longitude);

        // Fetch all golf courses
        const courses = await GolfCourse.find();

        if (courses.length === 0) {
            return res.status(404).json({ message: "No golf courses found" });
        }

        // Fetch the user's saved courses
        const savedCourses = await SavedCourse.find({ user: userId }).select('course');
        const savedCourseIds = savedCourses.map((saved) => saved.course.toString());

        // Function to calculate distance using Haversine formula
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const toRadians = (deg) => (deg * Math.PI) / 180;
            const R = 6371; // Radius of Earth in km
            const dLat = toRadians(lat2 - lat1);
            const dLon = toRadians(lon2 - lon1);
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distance in km
        };

        // Add the isSaved and distance field to each course
        const coursesWithSavedStatus = courses.map((course) => {
            const courseLat = course.latitude;
            const courseLon = course.longitude;

            // Calculate distance from user to course
            const distance = calculateDistance(userLat, userLon, courseLat, courseLon);

            return {
                ...course.toObject(),
                isSaved: savedCourseIds.includes(course._id.toString()),
                distance: distance.toFixed(2) // Round to 2 decimal places
            };
        });

        res.status(200).json({ courses: coursesWithSavedStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

  

const saveCourse = asyncHandler(async (req, res) => {
    try {
      const { courseId } = req.body;
      const userId = req.user._id; // Assuming user info is available in req.user
  
      if (!courseId) {
        return res.status(400).json({ status: false, message: "Course ID is required." });
      }
  
      // Check if the course exists
      const course = await GolfCourse.findById(courseId);
      if (!course) {
        return res.status(404).json({ status: false, message: "Course not found." });
      }
  
      // Check if the course is already saved
      const existingSavedCourse = await SavedCourse.findOne({ user: userId, course: courseId });
  
      if (existingSavedCourse) {
        // Unsave the course
        await existingSavedCourse.deleteOne();
        return res.status(200).json({ status: true, message: "Course removed from saved list." });
      } else {
        // Save the course
        const newSavedCourse = new SavedCourse({ user: userId, course: courseId });
        await newSavedCourse.save();
        return res.status(200).json({ status: true, message: "Course added to saved list." });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server error." });
    }
  });

  
  const getSavedCourses = asyncHandler(async (req, res) => {
    try {
      const userId = req.user._id; // Assuming user info is available in req.user
  
      // Find saved courses for the user
      const savedCourses = await SavedCourse.find({ user: userId }).populate('course', '-__v');
  
      res.status(200).json({
        status: true,
        message: "Saved courses retrieved successfully.",
        data: savedCourses,
        // data: savedCourses.map((item) => ({
        //   courseId: item.course._id,
        //   name: item.course.name,
        //   address: item.course.address,
        //   city: item.course.city,
        //   state: item.course.state,
        //   image: item.course.image,
        //   savedAt: item.savedAt,
        // })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server error." });
    }
  });

  module.exports = {saveCourse, getSavedCourses , getCoursesWithSavedStatus, getCoursesWithSavedStatusNew};