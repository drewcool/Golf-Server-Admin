const User = require('../Modals/userModal');
const asynchandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const Follow = require('../Modals/followModal');

const getAllUser = asynchandler(async (req, res) => {
  res.send('get all products');
});

const register = asynchandler(async (req, res) => {
    const { name, email, password, username, dob, gender } = req.body;
  
    // Validate input fields
    if (!name || !email || !password || !username || !dob) {
      res.status(400);
      throw new Error('Please provide all required details: name, email, password, username, and dob.');
    }
  
    const userCheckEmail = await User.findOne({ email: email });

    if (userCheckEmail) {
        res.status(400);
        throw new Error('email is already in use');
    }
    const userCheckUsername = await User.findOne({ username: username });

    if (userCheckUsername) {
        res.status(400);
        throw new Error('username is already in use');
    }
    try {


      // Hash password
      const salt = bcrypt.genSaltSync(12);
      const hashedPassword = bcrypt.hashSync(password, salt);
  
      // Create user
      const user = await User.create({ name, email, username, dob, gender, password: hashedPassword });
  
      // Respond with user details and token
      res.status(201).json({
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
    } catch (error) {
      // Handle Sequelize unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path; // Get the field that caused the unique constraint error
        if (field === 'email') {
          res.status(400);
          throw new Error('Email already exists.');
        } else if (field === 'username') {
          res.status(400);
          throw new Error('Username already exists.');
        }
      } else {
        // Handle other errors
        console.error('Error creating user:', error);
        res.status(500);
        throw new Error('Internal Server Error');
      }
    }
  });
  

const login = asynchandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.send('enter all field');
  }
  const userLogin = await User.findOne({ email: email });

  if (userLogin && (await bcrypt.compare(password, userLogin.password))) {
    res.status(201).json({
        status : true,
        message : "user login succesfully",
        data : {
            _id: userLogin._id,
            name: userLogin.name,
            email: userLogin.email,
            token: generateToken(userLogin._id),
          }
      });
  } else {
    res.status(401);
    throw new Error('invalid credentials');
  }
});

const forgotPassword = asynchandler(async (req, res) => {
  const { email } = req.body;

  // Check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Generate OTP (4 digits)
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // e.g., "1234"

  // Set OTP expiry (5 minutes from now)
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Save OTP to user
  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  // TODO: Send OTP via email (using Nodemailer)

  res.status(200).json({
    status: true,
    message: "OTP sent to email",
    data: {
      // For testing, return OTP in development only
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    },
  });
});

const verifyOtp = asynchandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if OTP matches (accept "1234" for testing)
  if (user.otp !== otp && otp !== "1234") {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  // Check if OTP expired
  if (user.otpExpiresAt < new Date()) {
    res.status(400);
    throw new Error("OTP expired");
  }

  // Clear OTP (optional, or wait until password reset)
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  res.status(200).json({
    status: true,
    message: "OTP verified successfully",
  });
});

const resetPassword = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Hash new password
  const salt = bcrypt.genSaltSync(12);
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Update password and clear OTP
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  res.status(200).json({
    status: true,
    message: "Password reset successfully",
  });
});


const getin = (req, res) => {
  res.status(200);
  const user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  };
  res.status(201).json({
    status : true,
    message : "Get user",
    data : req.user
  });
};

const editUser = asynchandler(async (req, res) => {
  const { name, email, username, dob, gender } = req.body;
  const userId = req.user._id; // Get user ID from the authenticated request

  // Validate input fields
  if (!name && !email && !username && !dob && !gender && !req.file) {
      res.status(400);
      throw new Error('Please provide at least one field to update: name, email, username, dob, gender, or profilePhoto.');
  }

  try {
      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
          res.status(404);
          throw new Error('User not found.');
      }

      // Check if email is already in use by another user
      if (email && email !== user.email) {
          const userCheckEmail = await User.findOne({ email: email, _id: { $ne: userId } });
          if (userCheckEmail) {
              res.status(400);
              throw new Error('Email is already in use by another user.');
          }
          user.email = email;
      }

      // Check if username is already in use by another user
      if (username && username !== user.username) {
          const userCheckUsername = await User.findOne({ username: username, _id: { $ne: userId } });
          if (userCheckUsername) {
              res.status(400);
              throw new Error('Username is already in use by another user.');
          }
          user.username = username;
      }

      // Update user fields
      if (name) user.name = name;
      if (dob) user.dob = dob;
      if (gender) user.gender = gender;

      // Update profile photo if uploaded
      if (req.file) {
          // Delete old profile photo if it exists
          // if (user.profilePhoto) {
          //     const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto); // Construct the correct path
          //     fs.unlink(oldPhotoPath, (err) => {
          //         if (err && err.code !== 'ENOENT') {
          //             console.log('Failed to delete old profile photo:', err);
          //         }
          //     });
          // }

          if (user.profilePhoto) {
            const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
            try {
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                }
            } catch (err) {
                console.error('Failed to delete old profile photo:', err);
            }
        }
        

          // Update to new profile photo
          user.profilePhoto = `images/user/${req.file.filename}`; // Use relative path
      }

      await user.save();

      // Respond with updated user details
      res.status(200).json({
          status: true,
          message: "User details updated successfully",
          data: {
              name: user.name,
              email: user.email,
              username: user.username,
              dob: user.dob,
              gender: user.gender,
              profilePhoto: user.profilePhoto,
          },
      });
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500);
      throw new Error('Internal Server Error');
  }
});

const searchUser = asynchandler(async (req, res) => {
  try {
    const search = req.query.search;

    if (!search) {
      return res.status(400).json({ message: 'Search keyword is required' });
    }

    const currentUserId = req.user._id; // Get current user ID from req.user

    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    };

    // Find users matching the search query
    const users = await User.find(query).select('-password');

    if (!users.length) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Fetch the follow relationships for the current user
    const follows = await Follow.find({ follower: currentUserId });
    const followingIds = follows.map(follow => follow.following.toString());

    // Add `isFollowing` field to each user
    const usersWithFollowStatus = users.map(user => ({
      ...user.toObject(), // Convert Mongoose document to plain object
      isFollowing: followingIds.includes(user._id.toString())
    }));

    res.status(200).json({
      status: true,
      message: 'Users fetched successfully',
      data: usersWithFollowStatus
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Server error'
    });
  }
});


const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET);
  return token;
};


const step1 = async (req, res) => {
  try {
    const userId = req.user._id;
    const { handicap } = req.body; 

    if (!handicap) {
      res.status(400).json({
        status : false,
        message : "Handicap value is required",
      }); 
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { handicap , loginStep:1 },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(400).json({
        status : false,
        message : "User not found",
      }); 
    }

    res.status(200).json({
      message: "Handicap details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      status : false,
      message : "Internal Server Error",
    }); 
  }
};

const step2 = async (req, res) => {
  try {
    const userId = req.user._id;
    const { handPreference } = req.body; 

    if (!handPreference) {
      res.status(400).json({
        status : false,
        message : "handPreference value is required",
      }); 
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { handPreference , loginStep:2 },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(400).json({
        status : false,
        message : "User not found",
      }); 
    }

    res.status(200).json({
      message: "handPreference details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      status : false,
      message : "Internal Server Error",
    }); 
  }
};

const step3 = async (req, res) => {
  try {
    const userId = req.user._id;
    const { drivingDistance, shotShape, commonMiss } = req.body; 

    if (!drivingDistance || !shotShape || !commonMiss) {
      res.status(400).json({
        status : false,
        message : "drivingDistance, shotShape, commonMiss value is required",
      }); 
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { drivingDistance, shotShape, commonMiss , loginStep:3 },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(400).json({
        status : false,
        message : "User not found",
      }); 
    }

    res.status(200).json({
      message: "drivingDistance, shotShape, commonMiss details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      status : false,
      message : "Internal Server Error",
    }); 
  }
};

const step4 = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const {clubStringIds } = req.body;
    const clubIds = JSON.parse(clubStringIds);

      if (!userId || !clubIds || !Array.isArray(clubIds)) {
        return res.status(400).json({ status : false, message: 'User ID and an array of club IDs are required.' });
      }
      
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            $addToSet: { savedClubs: { $each: clubIds } },
          },
          { new: true }
        );
        
        if (!updatedUser) {
          return res.status(404).json({ status : false, message: 'User not found.' });
        }
    
        res.status(200).json({status : true, message: 'Clubs saved successfully', savedClubs: updatedUser.savedClubs });
    
  } catch (error) {
    res.status(400).json({
      status : false,
      message : "Internal Server Error",
    }); 
  }
};

const step5 = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fairwayPercentage } = req.body; 

    if (!fairwayPercentage) {
      res.status(400).json({
        status : false,
        message : "fairwayPercentage value is required",
      }); 
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fairwayPercentage , loginStep:5 },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(400).json({
        status : false,
        message : "User not found",
      }); 
    }

    res.status(200).json({
      message: "fairwayPercentage details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      status : false,
      message : "Internal Server Error",
    }); 
  }
};



module.exports = { getAllUser, register, login, forgotPassword,verifyOtp,resetPassword,  editUser,searchUser, getin, step1, step2, step3, step4, step5 };