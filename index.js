
const express = require('express');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleWere/errorMiddlewere');
const fs = require('fs');
const path = require('path');
const app = express();
require('dotenv').config();
const cors = require("cors");
const axios = require('axios');

// CORS configuration to allow your frontend domains
app.use(cors({
  origin: [
    'http://13.50.244.87',
    'http://13.50.244.87:3000',
    'http://13.50.244.87:3001',
    'http://13.50.244.87:5173',
    'http://13.51.189.31:5000', //new
    'http://13.51.189.31', //new
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://golfserver.appsxperts.live',
    'https://golfserver.appsxperts.live:3000',
    'https://golfserver.appsxperts.live:3001',
    'https://golfserver.appsxperts.live:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

const PORT = process.env.PORT || 5001;

// Ensure required directories exist
const ensureDirectories = () => {
  const directories = [
    'images',
    'images/user',
    'images/courses',
    'images/lession',
    'images/lession/videos',
    'images/lession/images',
    'images/modLession',
    'images/modLession/videos',
    'images/modLession/images',
    'images/practice',
    'images/practice/videos',
    'images/practice/images'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

//DataBase connection
connectDB();

// Create directories on startup
ensureDirectories();

//body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/images', express.static('images'));

// Handle preflight requests
app.options('*', cors());


app.get('/', (req, res) => {
  res.send('Wellcome to GOLF club');
});

// Health check route
app.get('/health', (req, res) => {
  const directories = [
    'images',
    'images/user',
    'images/courses',
    'images/lession',
    'images/lession/videos',
    'images/lession/images',
    'images/modLession',
    'images/modLession/videos',
    'images/modLession/images',
    'images/practice',
    'images/practice/videos',
    'images/practice/images'
  ];

  const status = {
    server: 'running',
    timestamp: new Date().toISOString(),
    directories: {}
  };

  directories.forEach(dir => {
    try {
      status.directories[dir] = {
        exists: fs.existsSync(dir),
        writable: false
      };
      
      if (status.directories[dir].exists) {
        const testFile = path.join(dir, 'health-check.txt');
        fs.writeFileSync(testFile, 'health check');
        fs.unlinkSync(testFile);
        status.directories[dir].writable = true;
      }
    } catch (error) {
      status.directories[dir] = {
        exists: false,
        writable: false,
        error: error.message
      };
    }
  });

  res.json(status);
});

//Routes

app.use('/api/user', require('./Routes/userRoute'));
app.use('/api/admin', require('./Routes/adminRoute'));
app.use('/api/golf', require('./Routes/GolfCourseRoute'));
app.use('/api/game', require('./Routes/game/gameRoundRoute'));
app.use('/api/report', require('./Routes/game/performanceRoute'));
app.use('/api/lession', require('./Routes/lession'));
app.use('/api/practice', require('./Routes/practice'));
// app.use('/api/product', require('./Routes/productRoute'));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server is running at PORT :- ${PORT}`);
});

/**
res.status(200).json({
        status : true,
        message : "user register succesfully",
        data : {
         name: user.name,
         email: user.email,
         username: user.username,
         dob: user.dob,
         token: generateToken(user._id),
        }
      }); 


      res.status(400).json({
        status : false,
        message : "user not register",
      }); 
 */
