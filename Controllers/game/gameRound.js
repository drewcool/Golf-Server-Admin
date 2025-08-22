
const GolfCourse = require("../../Modals/GolfCourse");
const roundModal = require("../../Modals/roundModal");
const GameData = require("../../Modals/GameData");

const startRound = async (req, res) => {
    try {
      const { courseId, userTeeId, otherUsers } = req.body;
      const adminId = req.user.id;
  
      if (!courseId || !userTeeId) {
        return res.status(400).json({ message: "courseId, userHandicap, and userTeeId are required" });
      }
  
      const course = await GolfCourse.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Golf course not found" });
      }
  
      const newRound = new roundModal({
        courseId,
        adminId,
        users: [
          {
            userId: adminId,
            handicap: req.user.handicap,
            playingHandicap: req.user.handicap, 
            teeId: userTeeId,
          },
          ...otherUsers.map((user) => ({
            userId: user.userId,
            handicap: user.handicap,
            playingHandicap: user.playingHandicap || user.handicap,
            teeId: user.teeId,
          })),
        ],
        status: "active", 
        startTime: new Date(),
      });
  
      await newRound.save();
  
      res.status(201).json({ message: "Round started successfully", round: newRound });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }


const getMyRounds = async (req, res) => {
    try {
      const adminId = req.user._id;
  
      const rounds = await roundModal.find({ adminId })
        .populate("courseId", "name city state") 
        .select("courseId users startTime status") 
        .exec();
  
      // Check if rounds exist
      if (!rounds.length) {
        return res.status(404).json({ message: "No rounds found for this admin" });
      }
  
      res.status(200).json({ message: "Rounds retrieved successfully", rounds });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
} 
const getRoundsAsPlayer = async (req, res) => {
    try {
      const userId = req.user._id;
  
      const rounds = await roundModal.find({
        adminId: { $ne: userId }, 
        "users.userId": userId, 
      })
        .populate("courseId", "name city state") 
        .select("courseId adminId users startTime status") 
        .exec();
  
      // Check if rounds exist
      if (!rounds.length) {
        return res.status(404).json({ message: "No rounds found where you are a participant" });
      }
  
      res.status(200).json({ message: "Rounds retrieved successfully", rounds });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
}
const getRound = async (req, res) => {
    try {
      const { roundId } = req.params;
  
      // Find the round by its ID and populate related fields
      const round = await roundModal.findById(roundId)
        .populate("courseId", "name address city state")
        .populate("adminId", "name email username profilePhoto")
        .populate("users.userId", "name email username profilePhoto")
        .populate("users.teeId", "color distanceInYards manScore womanScore")
        .exec();
  
      // Check if the round exists
      if (!round) {
        return res.status(404).json({ message: "Round not found" });
      }
  
      res.status(200).json({ message: "Round retrieved successfully", round });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
const saveGame =  async (req, res) => {
    try {
      const { hitLocations, courseId, teeId } = req.body;
      const userId = req.user.id;
  
      if (!courseId || !teeId || !hitLocations || !Array.isArray(hitLocations) || hitLocations.length === 0) {
        return res.status(400).json({ message: "Invalid or missing data fields" });
      }
  
      const newGameData = new GameData({
        userId,
        courseId,
        teeId,
        hitLocations,
        timestamp: new Date(),
      });
  
      await newGameData.save();
  
      res.status(201).json({ message: "Game data saved successfully", gameData: newGameData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
}

const getSavedGames = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch saved games for the logged-in user
        const savedGames = await GameData.find({ userId }).sort({ timestamp: -1 });

        if (!savedGames || savedGames.length === 0) {
            return res.status(404).json({ message: "No saved games found" });
        }

        res.status(200).json({ savedGames });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};



module.exports = { startRound, getMyRounds, getRoundsAsPlayer, getRound, saveGame, getSavedGames };