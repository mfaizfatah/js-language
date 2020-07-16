const redis = require('../adapter/redis');
var Base64 = require('js-base64').Base64;

module.exports = (req,res,next) => {
    if (req.headers.authorization == "") {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
    const token = req.headers.authorization.split(" ")[1];
    redis.get(token, (err, reply) => {
        if (err || !reply) {
            return res.status(401).json({
                message: 'Auth failed'
            })
        } else {
            redis.set(token, reply.toString(), 'EX', parseInt(process.env.TOKEN_DURATION), (err, data) => {
                if (err) {
                    console.log(err)
                }
            })
            var decode = Base64.decode(reply.toString())
            req.userData = JSON.parse(decode)
            next()
            }
        })
};