require('dotenv').config();
const app = require('./src/app');
const connectToDB = require('./src/db/db');
const initSocketServer = require('./src/socket/socket.server');
const httpServer = require('http').createServer(app);


connectToDB();
initSocketServer(httpServer);

// app.listen(3000, () => {
//     console.log('listening');
// })
httpServer.listen(3000, () => {
    console.log('listening');
});