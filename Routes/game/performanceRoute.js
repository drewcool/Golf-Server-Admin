const express = require("express");
const router = express.Router();
const protectUser = require("../../middleWere/authUserMiddlewere");
const { getStrokesGained, getStrokesGainedAll, getStrokesGained1, getDrivingStats } = require("../../Controllers/game/performanceControler");
const GameData = require("../../Modals/GameData");



router.get("/getStrokesGained", protectUser, getStrokesGained );
router.post('/strokes-gainedold', protectUser, getStrokesGainedAll );
router.post("/strokes-gained", protectUser, getStrokesGained1);


router.post("/driving-stats", protectUser, getDrivingStats );



// Placeholder for Strokes Gained baseline data (to be updated in the future)
const baselineData = {
    "Fairway": { 50: 2.5, 100: 2.8, 150: 3.0, 200: 3.3, 250: 3.7 },
    "Rough": { 50: 2.7, 100: 3.0, 150: 3.4, 200: 3.8, 250: 4.2 },
    "Deep Rough": { 50: 3.0, 100: 3.3, 150: 3.7, 200: 4.2, 250: 4.6 },
    "Sand": { 50: 3.2, 100: 3.5, 150: 4.0, 200: 4.5, 250: 5.0 }
};

// Function to calculate standard deviation
function calculateStandardDeviation(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
}

// Function to calculate strokes gained
function calculateStrokesGained(startingPoint, endingLie, distanceYard, totalDistance) {
    if (!baselineData[startingPoint] || !baselineData[endingLie]) return 0; // Placeholder
    
    const startBaseline = Object.entries(baselineData[startingPoint])
        .reduce((prev, curr) => (Math.abs(curr[0] - totalDistance) < Math.abs(prev[0] - totalDistance) ? curr : prev))[1];
    
    const endBaseline = Object.entries(baselineData[endingLie])
        .reduce((prev, curr) => (Math.abs(curr[0] - distanceYard) < Math.abs(prev[0] - distanceYard) ? curr : prev))[1];
    
    return startBaseline - endBaseline - 1;
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
}

// Placeholder function for strokes gained (to be updated when data is available)
function calculateStrokesGained(startingPoint, endingLie, distanceYard, totalDistance) {
    return 0; // Placeholder value
}

// 1️⃣ Driving API - First shot from each game
router.get("/driving", protectUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const games = await GameData.find({ userId });

        const drivingData = games
            .map(game => game.hitLocations.length > 0 ? game.hitLocations[0] : null)
            .filter(hit => hit !== null);

        const totalDistance = drivingData.reduce((sum, hit) => sum + hit.distance_yard, 0);
        const averageDistance = drivingData.length ? totalDistance / drivingData.length : 0;

        const fairwayCount = drivingData.filter(hit => hit.ending_lie === "Fairway").length;
        const fairwayPercentage = drivingData.length ? (fairwayCount / drivingData.length) * 100 : 0;

        const distances = drivingData.map(hit => hit.distance_yard);
        const stdDeviation = calculateStandardDeviation(distances);

        const missBias = 0; // Placeholder for miss bias calculation
        const strokesGained = drivingData.map(hit => calculateStrokesGained(hit.starting_point, hit.ending_lie, hit.distance_yard, totalDistance));
        
        res.json({
            drivingData,
            totalDistance,
            averageDistance,
            fairwayCount,
            fairwayPercentage,
            stdDeviation,
            missBias,
            strokesGained
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error", details: error.message });
    }
});


// Approach API with Advanced Metrics
router.get("/approach", protectUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const games = await GameData.find({ userId });

        const approachData = games
            .flatMap(game => game.hitLocations.slice(1)) // Remove first shot
            .filter(hit => hit.ending_lie !== "Green");  // Exclude "Green" shots

        if (approachData.length === 0) {
            return res.json({
                approachData: [],
                biasRL: { left: 0, right: 0 },
                biasLongShort: { long: 0, short: 0 },
                greensInReg: "0%",
                avgMiss: { total: 0, average: 0 },
                strokesGained: { total: 0, average: 0 },
                yardagePercentages: {
                    "0-50": "0%",
                    "50-75": "0%",
                    "75-100": "0%",
                    "100-250": "0%",
                    "250+": "0%"
                }
            });
        }

        // 1️⃣ Bias R/L (Right/Left)
        const biasRL = {
            left: approachData.filter(hit => hit.dispersion === "Left").length,
            right: approachData.filter(hit => hit.dispersion === "Right").length
        };

        // 2️⃣ Bias Long/Short
        const biasLongShort = {
            long: approachData.filter(hit => hit.distance_yard > 100).length,
            short: approachData.filter(hit => hit.distance_yard <= 100).length
        };

        // 3️⃣ Greens in Regulation (GIR %)
        const greensInRegCount = games
            .flatMap(game => game.hitLocations)
            .filter(hit => hit.ending_lie === "Green").length;

        const greensInRegPercentage = ((greensInRegCount / approachData.length) * 100).toFixed(2) + "%";

        // 4️⃣ Average % Miss (Deviation from target)
        const avgMiss = calculateStandardDeviation(
            approachData.map(hit => parseFloat(hit.dispersion) || 0)
        );

        // 5️⃣ Strokes Gained (Simplified logic)
        const strokesGained = calculateStandardDeviation(
            approachData.map(hit => (hit.distance_yard / 100))
        );

        // 6️⃣ Distance Ranges (0-50, 50-75, 75-100, 100-250, 250+ yards)
        const distanceRanges = {
            "0-50": (approachData.filter(hit => hit.distance_yard <= 50).length / approachData.length * 100).toFixed(2) + "%",
            "50-75": (approachData.filter(hit => hit.distance_yard > 50 && hit.distance_yard <= 75).length / approachData.length * 100).toFixed(2) + "%",
            "75-100": (approachData.filter(hit => hit.distance_yard > 75 && hit.distance_yard <= 100).length / approachData.length * 100).toFixed(2) + "%",
            "100-250": (approachData.filter(hit => hit.distance_yard > 100 && hit.distance_yard <= 250).length / approachData.length * 100).toFixed(2) + "%",
            "250+": (approachData.filter(hit => hit.distance_yard > 250).length / approachData.length * 100).toFixed(2) + "%"
        };

        res.json({
            approachData,
            biasRL,
            biasLongShort,
            greensInReg: greensInRegPercentage,
            avgMiss,
            strokesGained,
            yardagePercentages: distanceRanges
        });

    } catch (error) {
        res.status(500).json({ error: "Server Error", details: error.message });
    }
});



// 2️⃣ Putting API - Shots where ending_lie is "Green"
router.get("/putting", protectUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const games = await GameData.find({ userId });

        const puttingData = games
            .flatMap(game => game.hitLocations.filter(hit => hit.club_name === "Putter"));

        const distanceRanges = [
            { range: "0-3", min: 0, max: 3 },
            { range: "3-6", min: 3, max: 6 },
            { range: "6-9", min: 6, max: 9 },
            { range: "9-15", min: 9, max: 15 },
            { range: "15-24", min: 15, max: 24 },
            { range: "24-39", min: 24, max: 39 },
            { range: "40+", min: 40, max: Infinity }
        ];

        const puttingStats = distanceRanges.map(({ range, min, max }) => {
            const attempts = puttingData.filter(hit => hit.distance_yard >= min && hit.distance_yard < max);
            const successful = attempts.filter(hit => hit === attempts[attempts.length - 1]).length;
            const successRate = attempts.length ? (successful / attempts.length) * 100 : 0;
            console.log("strokesGained data" , attempts, max );
            
            const strokesGained = attempts.map(hit => calculateStrokesGained(hit.starting_point, hit.ending_lie, hit.distance_yard, max));
            return { range, successRate: `${successRate.toFixed(1)}%`, attempts: `${successful}/${attempts.length}`, strokesGained };
        });

        res.json({
            status:true,
            puttingStats,
            games
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error", details: error.message });
    }
});



module.exports = router;
