const errorHandler = (err, req, res, next) => {
    const statusCode = res.status ? res.statusCode : 500
    res.status(statusCode)
    res.json({
        message: err.message,
        status:false,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })
}

module.exports = { errorHandler }