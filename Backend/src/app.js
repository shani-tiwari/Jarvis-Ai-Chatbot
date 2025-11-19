const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
// using middlewares  - In Express, middleware order matters. The cors() middleware should be applied before the routes that need it.
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',   // frontend url
    credentials: true  // to allow cookies from frontend
}));



// creating routes
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
// using Routes 
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);





module.exports = app;