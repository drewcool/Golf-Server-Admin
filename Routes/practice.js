const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Practice = require("../Modals/Practice");
const protectUser = require("../middleWere/authUserMiddlewere");
const GameData = require("../Modals/GameData");
const GolfCourse = require("../Modals/GolfCourse");
const fs = require('fs');


const LagPuttTornado = require("../Modals/practice/LagPuttTornado");
const StrokeTest = require("../Modals/practice/StrokeTest");
const Makeable = require("../Modals/practice/Makeable");
const SimulatedRound = require("../Modals/practice/SimulatedRound");
const UltimateChippingDrill = require("../Modals/practice/UltimateChippingDrill");
const UltimateChippingDrillRough = require("../Modals/practice/UltimateChippingDrillRough");
const Survivor = require("../Modals/practice/Survivor");
const DriverTest = require("../Modals/practice/DriverTest");
const Approach = require("../Modals/practice/Approach");
const ApproachVariable = require("../Modals/practice/ApproachVariable");


// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = "images/practice/";
        if (file.fieldname === "video") uploadPath += "videos/";
        if (file.fieldname === "thumbnail") uploadPath += "images/";
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });


// --------------------------------------
/** 
// Create Practice Entry
router.post("/add-practice", upload.fields([{ name: "video" }, { name: "thumbnail" }]), async (req, res) => {
    try {
        const { title, description, type } = req.body;
        if (!req.files.video) return res.status(400).json({ message: "No video uploaded" });
        const newEntry = new Practice({
            title,
            description,
            type,
            video: req.files.video[0].path,
            thumbnail: req.files.thumbnail ? req.files.thumbnail[0].path : "",
        });
        await newEntry.save();
        console.log("newEntry", newEntry);

        res.status(201).json({ message: "Practice entry added", data: newEntry });
    } catch (error) {
        console.log("error", error);

        res.status(500).json({ message: "Server Error", error });
    }
});

// Get Practice Entries by Type with Static Score
const getPracticeByType = async (req, res, type) => {
    try {
        const entries = await Practice.find({ type });
        const responseData = entries.map(entry => ({ ...entry.toObject(), score: 10 })); // Static score value
        res.status(200).json({ status: true, data: responseData });
    } catch (error) {
        res.status(500).json({ status: false, message: "Server Error", error });
    }
};

router.get("/get-practice-putting", (req, res) => getPracticeByType(req, res, "Putting"));  // Putting
router.get("/get-practice-short-game", (req, res) => getPracticeByType(req, res, "Short-game"));  // Short-game
router.get("/get-practice-full-swing", (req, res) => getPracticeByType(req, res, "Full-swing")); // Full-swing

// Edit Practice Entry
router.put("/edit-practice/:id", upload.fields([{ name: "video" }, { name: "thumbnail" }]), async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = { ...req.body };
        if (req.files.video) updatedData.video = req.files.video[0].path;
        if (req.files.thumbnail) updatedData.thumbnail = req.files.thumbnail[0].path;
        const updatedEntry = await Practice.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedEntry) return res.status(404).json({ message: "Entry not found" });
        res.status(200).json({ message: "Practice entry updated", data: updatedEntry });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Delete Practice Entry
router.delete("/delete-practice/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEntry = await Practice.findByIdAndDelete(id);
        if (!deletedEntry) return res.status(404).json({ message: "Entry not found" });
        res.status(200).json({ message: "Practice entry deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// _____ old 10 APIs _________________________________________________________

router.post("/practice", async (req, res) => {
    try {
        const newPractice = new Practice(req.body);
        await newPractice.save();
        res.status(201).json({ message: "Saved successfully", data: newPractice });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /practice/lag-putt

router.get("/lag-putt-old", protectUser, async (req, res) => {
    try {
        const userId = req.user._id;

        // ✅ 1. Fetch Practice data
        const practiceData = await Practice.find({ type: "LagPuttTornado" });

        // ✅ 2. Fetch GameData for user
        const games = await GameData.find({ userId });

        let holeIt = 0;
        let within10 = 0;
        let beyond10 = 0;

        for (const game of games) {
            const { hitLocations, teeId, courseId } = game;

            if (!hitLocations || hitLocations.length === 0) continue;

            // ✅ Check if last shot was with Putter
            const lastHit = hitLocations[hitLocations.length - 1];
            if (lastHit?.club_name === "Putter") {
                holeIt++;
            }

            // ✅ First Putter usage
            const firstPutter = hitLocations.find(hit => hit.club_name === "Putter");
            if (!firstPutter) continue;

            // ✅ Match teeId from GolfCourse
            const course = await GolfCourse.findById(courseId);
            if (!course) continue;

            const teeDetail = course.teeDetails.find(td => td._id.toString() === teeId.toString());
            if (!teeDetail || !teeDetail.distanceInYards) continue;

            const totalDistance = teeDetail.distanceInYards;
            const remaining = firstPutter.distance_yard || 0;

            const percentRemaining = (remaining / totalDistance) * 100;

            if (percentRemaining <= 10) {
                within10++;
            } else {
                beyond10++;
            }
        }

        // ✅ Combined Response
        res.json({
            status: true,
            stats: {
                holeIt,
                within10Percent: within10,
                beyond10Percent: beyond10
            },
            practice: practiceData,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: true, error: "Server error" });
    }
});



// GET /practice/lag-putt
router.get("/makeable-old2", async (req, res) => {
    try {
        const data = await Practice.find({ type: "makeable" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /practice/lag-putt
router.get("/lag-putt-old", async (req, res) => {
    try {
        const data = await Practice.find({ type: "Makeable" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

*/

// _____ NEW 10 APIs _________________________________________________________

//  1.lag-putt
router.post('/upload-lag-putt', async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }

        let existingData = await LagPuttTornado.findOne();

        if (existingData) {
            existingData.title = title;
            existingData.description = description;
            await existingData.save();
            return res.json({ status: true, message: 'Data updated successfully.', data: existingData });
        }

        const newData = await LagPuttTornado.create({ title, description });
        res.status(201).json({status: true, message: 'Data uploaded successfully.', data: newData });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// Get Lag Putt Tornado data
router.get('/lag-putt', protectUser, async (req, res) => {
    try {
        const userId = req.user._id;

        const data = await LagPuttTornado.findOne();

        // ✅ 2. Fetch GameData for user
        const games = await GameData.find({ userId });

        let holeIt = 0;
        let within10 = 0;
        let beyond10 = 0;

        for (const game of games) {
            const { hitLocations, teeId, courseId } = game;

            if (!hitLocations || hitLocations.length === 0) continue;

            // ✅ Check if last shot was with Putter
            const lastHit = hitLocations[hitLocations.length - 1];
            if (lastHit?.club_name === "Putter") {
                holeIt++;
            }

            // ✅ First Putter usage
            const firstPutter = hitLocations.find(hit => hit.club_name === "Putter");
            if (!firstPutter) continue;

            // ✅ Match teeId from GolfCourse
            const course = await GolfCourse.findById(courseId);
            if (!course) continue;

            const teeDetail = course.teeDetails.find(td => td._id.toString() === teeId.toString());
            if (!teeDetail || !teeDetail.distanceInYards) continue;

            const totalDistance = teeDetail.distanceInYards;
            const remaining = firstPutter.distance_yard || 0;

            const percentRemaining = (remaining / totalDistance) * 100;

            if (percentRemaining <= 10) {
                within10++;
            } else {
                beyond10++;
            }
        }

        // ✅ Combined Response
        res.json({
            status: true,
            stats: {
                holeIt,
                within10Percent: within10,
                beyond10Percent: beyond10
            },
            data: data,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

router.get('/lag-putt-admin', async (req, res) => {
  try {

      const data = await LagPuttTornado.findOne();

      res.json({
          status: true,
          data: data,
      });
  } catch (err) {
      res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// 2 stroke-test

router.post('/upload-stroke-test', async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }

        let existingData = await StrokeTest.findOne();

        if (existingData) {
            existingData.title = title;
            existingData.description = description;
            await existingData.save();
            return res.json({ status: true, message: 'Data updated successfully.', data: existingData });
        }

        const newData = await StrokeTest.create({ title, description });
        res.status(201).json({ status: true, message: 'Data uploaded successfully.', data: newData });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// Get Stroke Test data
router.get('/stroke-test', async (req, res) => {
    try {
        const data = await StrokeTest.findOne();
        if (!data) {
            return res.status(404).json({ message: 'No data found.' });
        }
        res.json({ status: true, data });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// 3 --------

// Upload or Update Makeable
router.post('/upload-makeable', upload.single('video'), async (req, res) => {
    try {
        const { title, description, howToDoIt, scoring } = req.body;
        const video = req.file?.path;

        let existing = await Makeable.findOne();

        if (existing) {
            const oldVideoPath = existing.video;

            existing.title = title;
            existing.description = description;
            existing.howToDoIt = howToDoIt;
            existing.scoring = scoring;
          
          if (video) {
              existing.video = video;
              if (oldVideoPath && fs.existsSync(oldVideoPath)) {
                  fs.unlinkSync(oldVideoPath);
              }
            } else {
              existing.video = oldVideoPath;
          }
          await existing.save();
      
            return res.json({ status: true, message: 'Data updated successfully.', data: existing });
        }

        const newData = await Makeable.create({
            title,
            description,
            video,
            howToDoIt,
            scoring
        });

        res.status(201).json({ status: true, message: 'Data uploaded successfully.', data: newData });

    } catch (err) {
        res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
});

// Get Makeable
router.get('/makeable', async (req, res) => {
    try {
        const data = await Makeable.findOne();
        
        if (!data) {
            return res.status(404).json({ status: false, message: 'No data found.' });
        }
        res.json({ status: true, data });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
});


// 4 ------- Upload or update Simulated Round
router.post('/upload-simulated-round', async (req, res) => {
    try {
      const { title, description } = req.body;
  
      if (!title || !description) {
        return res.status(400).json({ status: false, message: 'Title and description are required.' });
      }
  
      let existing = await SimulatedRound.findOne();
  
      if (existing) {
        existing.title = title;
        existing.description = description;
        await existing.save();
        return res.json({ status: true, message: 'Data updated successfully.', data: existing });
      }
  
      const newData = await SimulatedRound.create({ title, description });
      res.status(201).json({ status: true, message: 'Data uploaded successfully.', data: newData });
  
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });
  
  // Get Simulated Round
  router.get('/simulated-round', async (req, res) => {
    try {
      const data = await SimulatedRound.findOne();
      if (!data) {
        return res.status(404).json({ status: false, message: 'No data found.' });
      }
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });


  // B1------ Upload or Update Doc's Ultimate Chipping Drill
router.post('/upload-chipping-drill-fairway', upload.single('video'), async (req, res) => {
    try {
      const { title, description, scoring } = req.body;
      const video = req.file?.path;
  
  
      let existing = await UltimateChippingDrill.findOne();
  
      if (existing) {
        const oldVideoPath = existing.video;

        existing.title = title;
        existing.description = description;
        existing.scoring = scoring;
        
        if (video) {
          existing.video = video;
          
          if (oldVideoPath && fs.existsSync(oldVideoPath)) {
            fs.unlinkSync(oldVideoPath);
          }
        } else {
          existing.video = oldVideoPath;
        }
        await existing.save();

        return res.json({ status: true, message: 'Data updated successfully.', data: existing });
      }
  
      const newData = await UltimateChippingDrill.create({
        title,
        description,
        video,
        scoring
      });
  
      res.status(201).json({ status: true, message: 'Data uploaded successfully.', data: newData });
  
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });
  
  // Get Doc's Ultimate Chipping Drill
  router.get('/chipping-drill-fairway', async (req, res) => {
    try {
      const data = await UltimateChippingDrill.findOne();
      if (!data) {
        return res.status(404).json({ status: false, message: 'No data found.' });
      }
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });


  // B2
  // Upload or Update Doc's Ultimate Chipping Drill (Rough)
router.post('/upload-chipping-drill-rough', upload.single('video'), async (req, res) => {
    try {
      const { title, description, scoring } = req.body;
      const video = req.file?.path;
  
  
      let existing = await UltimateChippingDrillRough.findOne();
  
      if (existing) {
        const oldVideoPath = existing.video;

        existing.title = title;
        existing.description = description;
        existing.scoring = scoring;
        
        if (video) {
          existing.video = video;
          
          if (oldVideoPath && fs.existsSync(oldVideoPath)) {
            fs.unlinkSync(oldVideoPath);
          }
        } else {
          existing.video = oldVideoPath;
        }
        
        await existing.save();
        return res.json({ status: true, message: 'Data updated successfully.', data: existing });
      }
  
      const newData = await UltimateChippingDrillRough.create({
        title,
        description,
        video,
        scoring
      });
  
      res.status(201).json({ status: true, message: 'Data uploaded successfully.', data: newData });
  
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });
  
  // Get Doc's Ultimate Chipping Drill (Rough)
  router.get('/chipping-drill-rough', async (req, res) => {
    try {
      const data = await UltimateChippingDrillRough.findOne();
      if (!data) {
        return res.status(404).json({ status: false, message: 'No data found.' });
      }
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });


  // B3

  // Upload or Update Survivor Drill
router.post('/upload-survivor', upload.single('video'), async (req, res) => {
    try {
      const { title, description } = req.body;
      const video = req.file?.path;
  
      let existing = await Survivor.findOne();
  
      if (existing) {
        const oldVideoPath = existing.video;

        existing.title = title;
        existing.description = description;
        
        if (video) {
          existing.video = video;
          
          if (oldVideoPath && fs.existsSync(oldVideoPath)) {
            fs.unlinkSync(oldVideoPath);
          }
        } else {
          existing.video = oldVideoPath;
        }
        
        await existing.save();
        return res.json({ status: true, message: 'Data updated successfully.', data: existing });
      }
  
      const newData = await Survivor.create({
        title,
        description,
        video
      });
  
      res.status(201).json({ status: true, message: 'Data uploaded successfully.', data: newData });
  
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });
  
  // Get Survivor Drill
  router.get('/survivor', async (req, res) => {
    try {
      const data = await Survivor.findOne();
      if (!data) {
        return res.status(404).json({ status: false, message: 'No data found.' });
      }
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });

  // C1 -------

  // Upload or Update Driver Test
router.post('/upload-driver-test', upload.single('video'), async (req, res) => {
    try {
      const { title, description, scoring } = req.body;
      const video = req.file?.path;
    
      let existing = await DriverTest.findOne();
  
      if (existing) {
        const oldVideoPath = existing.video;

        existing.title = title;
        existing.description = description;
        existing.scoring = scoring;

        if (video) {
          existing.video = video;
  
          if (oldVideoPath && fs.existsSync(oldVideoPath)) {
              fs.unlinkSync(oldVideoPath);
          }
      } else {
          existing.video = oldVideoPath;
      }

        await existing.save();
        return res.json({ status: true, message: 'Data updated successfully.', data: existing });
      }
  
      const newData = await DriverTest.create({
        title,
        description,
        video,
        scoring
      });
  
      res.status(201).json({ status: true, message: 'Data uploaded successfully.', data: newData });
  
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });
  
  // Get Driver Test
  router.get('/driver-test', async (req, res) => {
    try {
      const data = await DriverTest.findOne();
      if (!data) {
        return res.status(404).json({ status: false, message: 'No data found.' });
      }
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });

  // C2 

  // Upload or Update Approach Drill
router.post('/upload-approach', upload.single('video'), async (req, res) => {
    try {
      const { title, description } = req.body;
      const video = req.file?.path;
    
      let existing = await Approach.findOne();
  
      if (existing) {
        const oldVideoPath = existing.video;

        existing.title = title;
        existing.description = description;
        if (video) {
          existing.video = video;
  
          if (oldVideoPath && fs.existsSync(oldVideoPath)) {
              fs.unlinkSync(oldVideoPath);
          }
      } else {
          existing.video = oldVideoPath;
      }
        await existing.save();


        return res.json({ status: true, message: 'Data updated successfully.', data: existing });
      }
  
      const newData = await Approach.create({
        title,
        description,
        video
      });
  
      res.status(201).json({ status: true, message: 'Data uploaded successfully.', data: newData });
  
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });
  
  // Get Approach Drill
  router.get('/approach', async (req, res) => {
    try {
      const data = await Approach.findOne();
      if (!data) {
        return res.status(404).json({ status: false, message: 'No data found.' });
      }
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });

  // C3

  // Upload or Update Approach (Variable)
router.post('/upload-approach-variable', upload.single('video'), async (req, res) => {
    try {
      const { title, description } = req.body;
      const video = req.file?.path;
    
      let existing = await ApproachVariable.findOne();
  
      if (existing) {
        const oldVideoPath = existing.video;

        existing.title = title;
        existing.description = description;

        if (video) {
          existing.video = video;
  
          if (oldVideoPath && fs.existsSync(oldVideoPath)) {
              fs.unlinkSync(oldVideoPath);
          }
      } else {
          existing.video = oldVideoPath;
      }
        await existing.save();


        return res.json({ status: true, message: 'Data updated successfully.', data: existing });
      }
  
      const newData = await ApproachVariable.create({
        title,
        description,
        video
      });
  
      res.status(201).json({ status: true, message: 'Data uploaded successfully.', data: newData });
  
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });
  
  // Get Approach (Variable)
  router.get('/approach-variable', async (req, res) => {
    try {
      const data = await ApproachVariable.findOne();
      if (!data) {
        return res.status(404).json({ status: false, message: 'No data found.' });
      }
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, message: 'Server error.', error: err.message });
    }
  });
  


module.exports = router;
