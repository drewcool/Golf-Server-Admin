const express = require('express')
const { getAllAdmin , register, login, getin, addClub, addManyClubs, getClubs, getUsersList, deleteClub, updateClub, getOneClub, deleteAdmin, deleteUser, deleteLession, editLession } = require('../Controllers/AdminController')
const protectAdmin = require('../middleWere/authAdminMiddlewere')
const GolfCourse = require('../Modals/GolfCourse')
const route = express.Router()

route.get('/get' , getAllAdmin)
route.post('/register' , register)
route.post('/login' , login)
route.post('/getin' , protectAdmin , getin)
route.delete('/delete/:id' , protectAdmin , deleteAdmin)

route.delete('/deleteUser/:id' , protectAdmin , deleteUser)

route.delete('/deleteLession/:id' , protectAdmin , deleteLession)
route.put('/editLession/:id' , protectAdmin , editLession)


route.post('/addClub' , protectAdmin , addClub)
route.put('/update-club/:id', updateClub);
route.get('/club/:id', getOneClub);

route.delete("/delete-clubs/:id", protectAdmin , deleteClub)
route.post('/addMeny' , protectAdmin , addManyClubs)
route.get('/get-clubs' , protectAdmin , getClubs)



route.get('/getUsersList' , protectAdmin , getUsersList)

route.get("/getGolfCourses", async (req, res) => {
    try {
      const courses = await GolfCourse.find(); 
      res.status(200).json({ message: "Golf courses retrieved successfully", courses });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });


  route.delete("/delete-GolfCourse/:id", protectAdmin , async (req, res) => {
    const { id } = req.params;
  
    const club = await GolfCourse.findById(id);
  
    if (!club) {
        res.status(404);
        throw new Error("Club not found");
    }
  
    await club.deleteOne();
  
    res.status(200).json({
        status: true,
        message: "Club deleted successfully",
    });
  })




module.exports = route