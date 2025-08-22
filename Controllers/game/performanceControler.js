const GameData = require("../../Modals/GameData");

const getExpectedStrokes = (distance, lie, par) => {
    // Example baseline strokes from PGA data (can be replaced with actual data)
    const baselineData = {
        "Fairway": { 50: 2.5, 100: 2.8, 150: 3.0, 200: 3.3, 250: 3.7 },
        "Rough": { 50: 2.7, 100: 3.0, 150: 3.4, 200: 3.8, 250: 4.2 },
        "Deep Rough": { 50: 3.0, 100: 3.3, 150: 3.7, 200: 4.2, 250: 4.6 },
        "Sand": { 50: 3.2, 100: 3.5, 150: 4.0, 200: 4.5, 250: 5.0 }
    };

    const lies = Object.keys(baselineData);
    if (!lies.includes(lie)) return 3.0; // Default value

    // Find the closest distance in baseline data
    const distances = Object.keys(baselineData[lie]).map(Number);
    const closestDistance = distances.reduce((prev, curr) => Math.abs(curr - distance) < Math.abs(prev - distance) ? curr : prev);

    return baselineData[lie][closestDistance] || 3.0;
};


const getStrokesGained = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user's saved games
        const savedGames = await GameData.find({ userId }).sort({ timestamp: -1 });

        if (!savedGames.length) {
            return res.status(404).json({ message: "No saved games found" });
        }

        let totalStrokesGained = 0;
        let strokesGainedPerShot = [];
        let calculatedShots = []; // Array for shots where Strokes Gained was calculated

        for (const game of savedGames) {
            for (let i = 0; i < game.hitLocations.length; i++) {
                const shot = game.hitLocations[i];
                
                // Extract necessary data
                const { distance_yard, lie, par } = shot;
                const distance = parseFloat(distance_yard);

                if (isNaN(distance)) continue; // Skip invalid distances

                // Get expected strokes based on distance & lie
                const expectedStrokes = getExpectedStrokes(distance, lie, par);
                
                // Actual strokes taken (assume 1 per hit)
                const actualStrokes = 1;

                // Calculate Strokes Gained
                const strokesGained = expectedStrokes - actualStrokes;
                totalStrokesGained += strokesGained;

                const shotData = {
                    shotNumber: i + 1,
                    club: shot.club_name,
                    distance,
                    lie,
                    expectedStrokes,
                    actualStrokes,
                    strokesGained
                };

                strokesGainedPerShot.push(shotData);
                calculatedShots.push(shotData); // Add to calculated shots array
            }
        }

        res.status(200).json({
            totalStrokesGained,
            strokesGainedPerShot,
            calculatedShots // New field with shots where Strokes Gained was calculated
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getStrokesGainedAll = async (req, res) => {
    try {
        const userId = req.user.id;
        const { club } = req.body; // Get club from request body

        // Fetch user's saved games
        const savedGames = await GameData.find({ userId }).sort({ timestamp: -1 });

        if (!savedGames.length) {
            return res.status(404).json({ message: "No saved games found" });
        }

        let totalStrokesGained = 0;
        let strokesGainedPerShot = [];
        let calculatedShots = []; // Array for filtered shots

        for (const game of savedGames) {
            for (let i = 0; i < game.hitLocations.length; i++) {
                const shot = game.hitLocations[i];

                // Skip if filtering by club and it doesn't match
                if (club !== "All" && shot.club_name !== club) continue;

                // Extract necessary data
                const { distance_yard, lie, par } = shot;
                const distance = parseFloat(distance_yard);

                if (isNaN(distance)) continue; // Skip invalid distances

                // Get expected strokes based on distance & lie
                const expectedStrokes = getExpectedStrokes(distance, lie, par);
                
                // Actual strokes taken (assume 1 per hit)
                const actualStrokes = 1;

                // Calculate Strokes Gained
                const strokesGained = expectedStrokes - actualStrokes;
                totalStrokesGained += strokesGained;

                const shotData = {
                    shotNumber: i + 1,
                    club: shot.club_name,
                    distance,
                    lie,
                    expectedStrokes,
                    actualStrokes,
                    strokesGained
                };

                strokesGainedPerShot.push(shotData);
                calculatedShots.push(shotData); // Add to filtered shots array
            }
        }

        res.status(200).json({
            totalStrokesGained,
            strokesGainedPerShot,
            calculatedShots // New field with filtered shots
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const calculateGolfStats = (hitLocations) => {
    let totalDistance = 0;
    let fairwayHits = 0;
    let totalShots = hitLocations.length;
    let totalMissBias = 0;
    let totalDispersion = 0;
    let strokesGained = 0;
    let validShots = 0;
    let strokesGainedPerShot = [];
    let shotNumber = 1;
  
    hitLocations.forEach((shot) => {
      let expectedStrokes = shot.par || 3; // Assuming par is the expected strokes
      let actualStrokes = 1; // Assuming each hit is one stroke
      let shotStrokesGained = expectedStrokes - actualStrokes;
      strokesGained += shotStrokesGained;
      
      strokesGainedPerShot.push({
        shotNumber,
        club: shot.club_name,
        distance: shot.distance_yard,
        lie: shot.lie,
        expectedStrokes,
        actualStrokes,
        strokesGained: shotStrokesGained,
      });
      shotNumber++;
  
      if (shot.distance_yard) {
        totalDistance += shot.distance_yard;
        validShots++;
      }
      if (shot.ending_lie === "Fairway") {
        fairwayHits++;
      }
      if (shot.dispersion) {
        totalDispersion += parseFloat(shot.dispersion);
      }
      if (shot.lie !== "Fairway") {
        totalMissBias += 1; // Counting miss bias
      }
    });
  
    return {
      totalStrokesGained: strokesGained,
      strokesGainedPerShot,
      calculatedShots: strokesGainedPerShot,
      averageDistance: validShots > 0 ? (totalDistance / validShots).toFixed(1) + "y" : "0y",
      fairwayPercentage: totalShots > 0 ? ((fairwayHits / totalShots) * 100).toFixed(1) + "%" : "0%",
      standardDeviation: totalDispersion > 0 ? (totalDispersion / totalShots).toFixed(1) + "y" : "0y",
      missBias: totalMissBias + "y",
    };
  };
  
  // Controller function
  const getStrokesGained1 = async (req, res) => {
    try {
      const userId = req.user.id; // Getting userId from token
      const { club } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      const games = await GameData.find({ userId }).lean();
      if (!games.length) {
        return res.status(404).json({ message: "No game data found" });
      }
  
      let allShots = [];
      games.forEach((game) => {
        game.hitLocations.forEach((shot) => {
          if (club === "All" || shot.club_name === club) {
            allShots.push(shot);
          }
        });
      });
  
      if (allShots.length === 0) {
        return res.status(404).json({ message: "No matching shots found" });
      }
  
      const stats = calculateGolfStats(allShots);
      res.status(200).json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };




// _________________________________________________

// Function to calculate Driving Stats
const calculateDrivingStats = (hitLocations) => {
    let totalDistance = 0;
    let fairwayHits = 0;
    let totalShots = hitLocations.length;
    let totalMissBias = 0;
    let totalDispersion = 0;
    let validShots = 0;
    let strokesGained = 0;
    let strokesGainedPerShot = [];
    let shotNumber = 1;
  
    hitLocations.forEach((shot) => {
      let expectedStrokes = shot.par || 3; // Assuming par is the expected strokes
      let actualStrokes = 1; // Assuming each hit is one stroke
      let shotStrokesGained = expectedStrokes - actualStrokes;
      strokesGained += shotStrokesGained;
      
      strokesGainedPerShot.push({
        shotNumber,
        club: shot.club_name,
        distance: shot.distance_yard,
        lie: shot.lie,
        expectedStrokes,
        actualStrokes,
        strokesGained: shotStrokesGained,
      });
      shotNumber++;
  
      if (shot.distance_yard) {
        totalDistance += shot.distance_yard;
        validShots++;
      }
      if (shot.ending_lie === "Fairway") {
        fairwayHits++;
      }
      if (shot.dispersion) {
        totalDispersion += parseFloat(shot.dispersion);
      }
      if (shot.lie !== "Fairway") {
        totalMissBias += 1; // Counting miss bias
      }
    });
  
    return {
      totalStrokesGained: strokesGained,
      strokesGainedPerShot,
      calculatedShots: strokesGainedPerShot,
      averageDistance: validShots > 0 ? (totalDistance / validShots).toFixed(1) + "y" : "0y",
      fairwayPercentage: totalShots > 0 ? ((fairwayHits / totalShots) * 100).toFixed(1) + "%" : "0%",
      standardDeviation: totalDispersion > 0 ? (totalDispersion / totalShots).toFixed(1) + "y" : "0y",
      missBias: totalMissBias + "y",
    };
  };
  
  // Controller function
  const getDrivingStats = async (req, res) => {
    try {
      const userId = req.user.id; // Getting userId from token
      const { club } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      const games = await GameData.find({ userId }).lean();
      if (!games.length) {
        return res.status(404).json({ message: "No game data found" });
      }
  
      let allShots = [];
      games.forEach((game) => {
        game.hitLocations.forEach((shot) => {
          if (club === "All" || shot.club_name === club) {
            allShots.push(shot);
          }
        });
      });
  
      if (allShots.length === 0) {
        return res.status(404).json({ message: "No matching shots found" });
      }
  
      const stats = calculateDrivingStats(allShots);
      res.status(200).json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  


module.exports = { getStrokesGained, getStrokesGainedAll, getStrokesGained1, getDrivingStats }
