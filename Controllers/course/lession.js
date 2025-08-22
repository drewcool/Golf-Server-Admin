const lessionModel = require("../../Modals/lessionModel");
const modifiedLession = require("../../Modals/modifiedLession");


const addLession = async (req, res) => {
    try {
      const { title, description } = req.body;
      if (!title || !req.files.thumbnail || !req.files.video || !description) {
        return res.status(400).json({
          status: false,
          message: "All fields are required",
        });
      }
  
      const newVideo = new lessionModel({
        title,
        thumbnail: req.files.thumbnail[0].path,
        video: req.files.video[0].path,
        description,
      });
  
      await newVideo.save();
  
      res.status(200).json({
        status: true,
        message: "Lesson video added successfully",
        data: {
          title: newVideo.title,
          thumbnail: newVideo.thumbnail,
          video: newVideo.video,
          description: newVideo.description,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: "Lesson video not added",
      });
    }
  }

  const getLession = async (req, res) => {
    try {
      const lessons = await lessionModel.find({});
  
      if (lessons.length === 0) {
        return res.status(400).json({
          status: false,
          message: "No lessons found",
        });
      }
  
      res.status(200).json({
        status: true,
        message: "Lessons fetched successfully",
        data: lessons,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Error fetching lessons",
      });
  }
}

const saveModifiedLession = async (req, res) => {
    try {
      const { title, originalLessionId } = req.body;
      const userId = req.user._id; // Assuming user is authenticated
  
      // Validate uploaded files
      if (!req.files["modifiedVideo"] || !req.files["modifiedPhoto"]) {
        return res.status(400).json({
          status: false,
          message: "Modified video and photo are required",
        });
      }
  
      const modifiedVideo = req.files["modifiedVideo"][0].path;
      const modifiedPhoto = req.files["modifiedPhoto"][0].path;
  
      // Save the modified lesson
      const newModifiedLession = new modifiedLession({
        originalLessionId,
        userId,
        modifiedVideo,
        modifiedPhoto,
        title
      });
  
      await newModifiedLession.save();
  
      res.status(201).json({
        status: true,
        message: "Modified lesson saved successfully",
        data: newModifiedLession,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Error saving modified lesson",
      });
    }
  };

  const getModifiedLessions = async (req, res) => {
    try {
      const userId = req.user._id; // Get user ID from token middleware
  
      const modifiedLessions = await modifiedLession.find({ userId }).populate("originalLessionId");
  
      if (!modifiedLessions.length) {
        return res.status(404).json({
          status: false,
          message: "No modified lessons found for this user.",
        });
      }
  
      res.status(200).json({
        status: true,
        message: "Modified lessons fetched successfully.",
        data: modifiedLessions,
      });
    } catch (error) {
      console.error("Error fetching modified lessons:", error);
      res.status(500).json({
        status: false,
        message: "Error fetching modified lessons.",
      });
    }
  };
  
  


module.exports = {addLession, getLession, saveModifiedLession, getModifiedLessions};