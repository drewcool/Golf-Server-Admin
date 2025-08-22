const jwt = require('jsonwebtoken')
const Admin = require('../Modals/adminModal')
const asyncHandler = require('express-async-handler')

const protectAdmin = asyncHandler(async (req, res, next) => {
    let token
    if (req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.admin = await Admin.findById(decoded.id).select("-password")
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
module.exports = protectAdmin