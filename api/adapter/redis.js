const redis = require("redis");
const { compareSync } = require("bcrypt");
const client = redis.createClient();

module.exports = client.on("error", function(error) {
    console.error(error);
});