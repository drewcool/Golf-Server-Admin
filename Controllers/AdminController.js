const Admin = require('../Modals/adminModal');
const User = require('../Modals/userModal');
const asynchandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Club = require('../Modals/Club');
const lessionModel = require('../Modals/lessionModel');

const getAllAdmin = asynchandler(async (req, res) => {
  res.send('get all products');
});

const register = asynchandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(401);
    throw new Error('please fill All details');
  }

  // Password Hashing
  const salt = bcrypt.genSaltSync(12);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const admin = await Admin.create({ name, email, password: hashedPassword });

  res.status(201).json({
    name: admin.name,
    email: admin.email,
    token: generateToken(admin._id),
  });
  res.send('Admin Registred');
});

const login = asynchandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.send('enter all field');
  }
  const adminLogin = await Admin.findOne({ email: email });

  if (adminLogin && (await bcrypt.compare(password, adminLogin.password))) {
    res.status(201).json({
      _id: adminLogin._id,
      name: adminLogin.name,
      email: adminLogin.email,
      token: generateToken(adminLogin._id),
    });
  } else {
    res.status(401);
    throw new Error('invalid credentials');
  }
});

const getin = (req, res) => {
  res.status(200);
  const admin = {
    id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
  };
  res.send(admin);
};

const deleteAdmin = asynchandler(async (req, res) => {
  const { id } = req.params;

  // Check if ID is provided
  if (!id) {
    res.status(400);
    throw new Error('Admin ID is required');
  }

  // Check if admin exists
  const admin = await Admin.findById(id);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  // Delete the admin
  await Admin.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Admin deleted successfully',
    deletedAdmin: {
      id: admin._id,
      name: admin.name,
      email: admin.email
    }
  });
});
const deleteUser = asynchandler(async (req, res) => {
  const { id } = req.params;

  // Check if ID is provided
  if (!id) {
    res.status(400);
    throw new Error('User ID is required');
  }

  try {
    // Check if user exists
    const user = await User.findById(id);
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: 'User deleted successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500);
    throw new Error('Internal Server Error');
  }
});
const deleteLession = asynchandler(async (req, res) => {
  const { id } = req.params;

  // Check if ID is provided
  if (!id) {
    res.status(400);
    throw new Error('lession ID is required');
  }

  try {
    // Check if lession exists
    const lession = await lessionModel.findById(id);
    
    if (!lession) {
      res.status(404);
      throw new Error('lession not found');
    }

    // Delete the lession
    await lessionModel.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: 'lession deleted successfully',
      // data: {
      //   id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   username: user.username
      // }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500);
    throw new Error('Internal Server Error');
  }
});
const editLession = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { title, thumbnail, video, status, description } = req.body;

  // Check if ID is provided
  if (!id) {
    res.status(400);
    throw new Error('Lesson ID is required');
  }

  try {
    // Check if lesson exists
    const lesson = await lessionModel.findById(id);
    
    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    // Create update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (video !== undefined) updateData.video = video;
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;

    // Update the lesson
    const updatedLesson = await lessionModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: 'Lesson updated successfully',
      data: updatedLesson
    });

  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Internal Server Error'
    });
  }
});

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  return token;
};


const addClub = asynchandler(async (req, res) => {
    const { code, name, type, brand, loft, description } = req.body;
  
    if (!name || !code || !type || !brand || loft === undefined) {
      res.status(400);
      throw new Error('Please provide all required fields (name, type, brand, loft).');
    }
  
    const newClub = new Club({
      name,
      code,
      type,
      brand,
      loft,
      description,
    });
  
    const createdClub = await newClub.save();
  
    res.status(201).json({
      status : true,
      message : "Club added succesfully",
      data : createdClub});
});

const updateClub = asynchandler(async (req, res) => {
  const { code, name, type, brand, loft, description } = req.body;
  const { id } = req.params; // Club ID should come from URL params

  if (!id) {
    res.status(400);
    throw new Error('Club ID is required.');
  }

  const club = await Club.findById(id);

  if (!club) {
    res.status(404);
    throw new Error('Club not found.');
  }

  // Update fields
  club.name = name || club.name;
  club.code = code || club.code;
  club.type = type || club.type;
  club.brand = brand || club.brand;
  club.loft = loft !== undefined ? loft : club.loft;
  club.description = description || club.description;

  const updatedClub = await club.save();

  res.status(200).json({
    status: true,
    message: "Club updated successfully",
    data: updatedClub
  });
});

const getOneClub = asynchandler(async (req, res) => {
  const { id } = req.params; // Club ID comes from URL

  if (!id) {
    res.status(400);
    throw new Error('Club ID is required.');
  }

  const club = await Club.findById(id);

  if (!club) {
    res.status(404);
    throw new Error('Club not found.');
  }

  res.status(200).json({
    status: true,
    message: "Club fetched successfully",
    data: club
  });
});



const deleteClub = asynchandler(async (req, res) => {
  const { id } = req.params;

  const club = await Club.findById(id);

  if (!club) {
      res.status(404);
      throw new Error("Club not found");
  }

  await club.deleteOne();

  res.status(200).json({
      status: true,
      message: "Club deleted successfully",
  });
});

const addManyClubs = asynchandler(async (req, res) => {
    const clubsData = [
      { code: "DR", name: "Driver Club", type: "Driver", brand: "Generic Brand", loft: 10.5, description: "Driver club for maximum distance." },
      { code: "Mini DR", name: "Mini Driver Club", type: "Driver", brand: "Generic Brand", loft: 11, description: "Compact driver for precision shots." },
      { code: "3W", name: "3 Wood", type: "Wood", brand: "Generic Brand", loft: 15, description: "Fairway wood for long-distance fairway shots." },
      { code: "4W", name: "4 Wood", type: "Wood", brand: "Generic Brand", loft: 17, description: "Fairway wood for versatile play." },
      { code: "5W", name: "5 Wood", type: "Wood", brand: "Generic Brand", loft: 19, description: "Fairway wood for high trajectory shots." },
      { code: "6W", name: "6 Wood", type: "Wood", brand: "Generic Brand", loft: 21, description: "Fairway wood for precise mid-range shots." },
      { code: "7W", name: "7 Wood", type: "Wood", brand: "Generic Brand", loft: 23, description: "Fairway wood for easier launch and control." },
      { code: "3H", name: "3 Hybrid", type: "Hybrid", brand: "Generic Brand", loft: 19, description: "Hybrid club for versatile long shots." },
      { code: "4H", name: "4 Hybrid", type: "Hybrid", brand: "Generic Brand", loft: 21, description: "Hybrid club for accuracy and distance." },
      { code: "5H", name: "5 Hybrid", type: "Hybrid", brand: "Generic Brand", loft: 24, description: "Hybrid club for mid-range shots." },
      { code: "6H", name: "6 Hybrid", type: "Hybrid", brand: "Generic Brand", loft: 27, description: "Hybrid club for high trajectory shots." },
      { code: "7H", name: "7 Hybrid", type: "Hybrid", brand: "Generic Brand", loft: 30, description: "Hybrid club for precise short-range shots." },
      { code: "2I", name: "2 Iron", type: "Iron", brand: "Generic Brand", loft: 18, description: "Iron club for long-distance control." },
      { code: "3I", name: "3 Iron", type: "Iron", brand: "Generic Brand", loft: 21, description: "Iron club for versatile long shots." },
      { code: "4I", name: "4 Iron", type: "Iron", brand: "Generic Brand", loft: 24, description: "Iron club for precision and distance." },
      { code: "5I", name: "5 Iron", type: "Iron", brand: "Generic Brand", loft: 27, description: "Iron club for mid-range shots." },
      { code: "6I", name: "6 Iron", type: "Iron", brand: "Generic Brand", loft: 30, description: "Iron club for controlled mid-range play." },
      { code: "7I", name: "7 Iron", type: "Iron", brand: "Generic Brand", loft: 34, description: "Iron club for accurate approach shots." },
      { code: "8I", name: "8 Iron", type: "Iron", brand: "Generic Brand", loft: 38, description: "Iron club for short approach shots." },
      { code: "9I", name: "9 Iron", type: "Iron", brand: "Generic Brand", loft: 42, description: "Iron club for high-lofted precision shots." },
      { code: "PW", name: "Pitching Wedge", type: "Wedge", brand: "Generic Brand", loft: 46, description: "Wedge for precise approach shots." },
      { code: "GW", name: "Gap Wedge", type: "Wedge", brand: "Generic Brand", loft: 50, description: "Wedge for short approach and chip shots." },
      { code: "SW", name: "Sand Wedge", type: "Wedge", brand: "Generic Brand", loft: 54, description: "Wedge for bunker and sand shots." },
      { code: "LW", name: "Lob Wedge", type: "Wedge", brand: "Generic Brand", loft: 58, description: "Wedge for high-lofted short shots." },
      { code: "48", name: "48-Degree Wedge", type: "Wedge", brand: "Generic Brand", loft: 48, description: "Wedge for controlled short shots." },
      { code: "50", name: "50-Degree Wedge", type: "Wedge", brand: "Generic Brand", loft: 50, description: "Wedge for precise short play." },
      { code: "52", name: "52-Degree Wedge", type: "Wedge", brand: "Generic Brand", loft: 52, description: "Wedge for approach shots." },
      { code: "54", name: "54-Degree Wedge", type: "Wedge", brand: "Generic Brand", loft: 54, description: "Wedge for sand and short play." },
      { code: "56", name: "56-Degree Wedge", type: "Wedge", brand: "Generic Brand", loft: 56, description: "Wedge for precise bunker shots." },
      { code: "58", name: "58-Degree Wedge", type: "Wedge", brand: "Generic Brand", loft: 58, description: "Wedge for lofted approach shots." },
      { code: "60", name: "60-Degree Wedge", type: "Wedge", brand: "Generic Brand", loft: 60, description: "Wedge for high-lofted precision shots." },
      { code: "62", name: "62-Degree Wedge", type: "Wedge", brand: "Generic Brand", loft: 62, description: "Wedge for extreme loft and spin control." },
      { code: "64", name: "64-Degree Wedge", type: "Wedge", brand: "Generic Brand", loft: 64, description: "Wedge for delicate short play." },
      { code: "PU", name: "Putter", type: "Putter", brand: "Generic Brand", loft: 3, description: "Putter for precision on the green." }
    ];
  
    try {
      // Insert all clubs into the database
      const createdClubs = await Club.insertMany(clubsData);
      res.status(201).json(createdClubs); // Respond with the created clubs
    } catch (error) {
      res.status(500).send('Error inserting clubs: ' + error.message);
    }
  });

  const getClubs = asynchandler(async (req, res) => {
    try {
      // Fetch all clubs from the database
      const clubs = await Club.find();
  
      if (!clubs || clubs.length === 0) {
        return res.status(404).json({ message: "No clubs found" });
      }
  
      res.status(200).json({
        status : true,
        message : "Get clubs",
        data : clubs
      }); 
    } catch (error) {
      res.status(500).json({ message: "Error fetching clubs: " + error.message });
    }
  });


  const getUsersList = asynchandler(async (req, res) => {
    try {
      const users = await User.find({}, "-password"); // Exclude password field
  
      res.status(200).json({
        status: true,
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Failed to fetch users",
        error: error.message,
      });
    }
  });
  
  

module.exports = { getAllAdmin, register, login, getin,deleteAdmin,deleteUser, deleteLession,editLession ,  addClub,deleteClub, addManyClubs, getClubs, getUsersList, updateClub, getOneClub };