const http = require('http');
const app = require('./app');
const logger = require('./api/utils/logger');

const port = process.env.PORT || 3000;

const server = http.createServer(app);
// console.log("Server running at port: ", port);
console.info(`Server running at port: ${port}`);
server.listen(port);