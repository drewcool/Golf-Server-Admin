const express = require("express");
const router = express.Router();
const protectUser = require("../../middleWere/authUserMiddlewere");
const GolfCourse = require("../../Modals/GolfCourse");
const roundModal = require("../../Modals/roundModal");
const GameData = require("../../Modals/GameData");
const { startRound, getRoundsAsPlayer, getRound, getMyRounds, saveGame, getSavedGames } = require("../../Controllers/game/gameRound");

router.post("/startRound", protectUser, startRound );

router.get("/getMyRounds", protectUser, getMyRounds );
  
router.get("/getRoundsAsPlayer", protectUser, getRoundsAsPlayer );
  

router.get("/getRound/:roundId", async (req, res) => {
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
});

router.get("/getRound/:roundId", getRound );
router.post("/saveGame", protectUser, saveGame );
router.get("/getSavedGames", protectUser, getSavedGames );


const data = {
  hitLocations : [
    {
     "club_id": "",
     "club_name": '',
     'distance_yard': '',
     "ending_lie": '',
     "dispersion": "",
     'lie': "",
     "wind_speed": "",
     "wind_direction": "",
     "in_between": "",
     "par": 4
    },
    {
     "club_id": "",
     "club_name": '',
     'distance_yard': '',
     "ending_lie": '',
     "dispersion": "",
     'lie': "",
     "wind_speed": "",
     "wind_direction": "",
     "in_between": "",
     "par": 4
    }
   ],
   courseId:"",
   teeId:""
}


  

module.exports = router;
