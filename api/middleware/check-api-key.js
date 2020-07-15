module.exports = (req, res, next) => {
    const apiKey = process.env.X_API_KEY
    if (apiKey != req.get('x-api-key')) {
        return res.status(401).json({
            message: 'Auth Failed'
        })
    } else {
        next()
    }    
}