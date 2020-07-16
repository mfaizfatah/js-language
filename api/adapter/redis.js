const redis = require("redis");
const { compareSync } = require("bcrypt");
const { responseWhitelist } = require("express-winston");
const client = redis.createClient();


module.exports = client.on('connect', function(){
    console.log('Connected to Redis');
});

module.exports = client.on('error', function(err) {
     console.log('Redis error: ' + err);
});

// module.exports = client.on("error", function(error) {
//     console.error(error);
//     if (error) {
//         throw error
//     }
// });