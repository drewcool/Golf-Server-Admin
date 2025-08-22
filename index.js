
const express = require('express');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleWere/errorMiddlewere');
const app = express();
require('dotenv').config();
const cors = require("cors");
const axios = require('axios');

app.use(cors())

const PORT = process.env.PORT || 5000;

//DataBase connection
connectDB();
//body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/images', express.static('images'));


app.get('/', (req, res) => {
  res.send('Wellcome to GOLF club');
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
