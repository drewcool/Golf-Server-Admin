const express = require('express')
const { getAllUser, register, login, getin, editUser, step1, step2, step3, step4, step5, searchUser, forgotPassword, verifyOtp, resetPassword } = require('../Controllers/UserController')
const protectUser = require('../middleWere/authUserMiddlewere')
const { ProfileUpload } = require('../middleWere/ProfileImageMiddlewere')
const { follow, unfollow, myFollowers, myFollowing, getNotifications, markAllNotificationsAsRead } = require('../Controllers/follow')
const route = express.Router()

route.get('/get' , getAllUser)
route.post('/register' , register)
route.post('/login' , login)
route.get('/getin' , protectUser , getin)
route.post("/edit-user",protectUser, ProfileUpload.single('profile_image'), editUser);
route.get("/search-user", searchUser);

route.post("/forgotPassword", forgotPassword);
route.post("/verifyOtp", verifyOtp);
route.post("/resetPassword", resetPassword);

route.post('/step1', protectUser, step1)
route.post('/step2', protectUser, step2)
route.post('/step3', protectUser, step3)
route.post('/step4', protectUser, step4)
route.post('/step5', protectUser, step5)


route.post('/follow', protectUser, follow)
route.post('/unfollow', protectUser, unfollow)
route.get('/myFollowers', protectUser, myFollowers)
route.get('/myFollowing', protectUser, myFollowing)

route.get("/notifications", protectUser, getNotifications);
route.get('/notifications/read-all', protectUser, markAllNotificationsAsRead);




module.exports = route