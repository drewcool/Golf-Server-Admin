const Hole = require("../../Modals/Hole");
const GolfCourse = require("../../Modals/GolfCourse");
const mongoose = require("mongoose");

// Save holes for a course
const saveCourseHoles = async (req, res) => {
  try {
    const { courseId, holes } = req.body;
    
    if (!courseId || !holes || !Array.isArray(holes)) {
      return res.status(400).json({
        status: false,
        message: "Course ID and holes array are required"
      });
    }
    
    // Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid course ID format"
      });
    }

    // Verify course exists
    const course = await GolfCourse.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        status: false,
        message: "Golf course not found",
        debug: { searchedId: courseId }
      });
    }

    // Delete existing holes for this course
    await Hole.deleteMany({ courseId });

    // Save new holes
    const savedHoles = [];
    for (const holeData of holes) {
      
      const hole = new Hole({
        courseId,
        courseName: holeData.courseName,
        hole: holeData.hole,
        par: holeData.par,
        hcp: holeData.hcp,
        green: holeData.green,
        waterHazard: holeData.waterHazard,
        sandBunker: holeData.sandBunker,
        fairway: holeData.fairway,
        teeBoxes: holeData.teeBoxes
      });
      
      const savedHole = await hole.save();
      savedHoles.push(savedHole);
    }

    res.status(201).json({
      status: true,
      message: "Holes saved successfully",
      data: {
        courseId,
        holesCount: savedHoles.length,
        holes: savedHoles
      }
    });

  } catch (error) {
    console.error("Error saving holes:", error);
    res.status(500).json({
      status: false,
      message: "Failed to save holes",
      error: error.message
    });
  }
};

// Get holes for a course
const getCourseHoles = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        status: false,
        message: "Course ID is required"
      });
    }

    const holes = await Hole.find({ courseId }).sort({ hole: 1 });

    res.status(200).json({
      status: true,
      message: "Holes retrieved successfully",
      data: {
        courseId,
        holesCount: holes.length,
        holes
      }
    });

  } catch (error) {
    console.error("Error retrieving holes:", error);
    res.status(500).json({
      status: false,
      message: "Failed to retrieve holes",
      error: error.message
    });
  }
};

// Delete holes for a course
const deleteCourseHoles = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        status: false,
        message: "Course ID is required"
      });
    }

    const result = await Hole.deleteMany({ courseId });

    res.status(200).json({
      status: true,
      message: "Holes deleted successfully",
      data: {
        courseId,
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error("Error deleting holes:", error);
    res.status(500).json({
      status: false,
      message: "Failed to delete holes",
      error: error.message
    });
  }
};

module.exports = {
  saveCourseHoles,
  getCourseHoles,
  deleteCourseHoles
};
