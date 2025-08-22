const jwt = require('jsonwebtoken')
const User = require('../Modals/userModal')
const asyncHandler = require('express-async-handler')

const protectUser = asyncHandler(async (req, res, next) => {
    let token
    console.log("token",req.headers.authorization);
    
   
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            console.log("decoded" , decoded);
            
            req.user = await User.findById(decoded.id).select("-password")
            next()
        } catch (error) {
            console.log(error);
            res.status(401)
            throw new Error("not authorized ")
        }
    }
    else{
        res.status(401)
        throw new Error("Please login again")
    }
})
module.exports = protectUser