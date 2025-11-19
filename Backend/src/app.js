const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
// using middlewares  - In Express, middleware order matters. The cors() middleware should be applied before the routes that need it.
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://jarvis-ai-chatbot.onrender.com",
   "https://jarvis-ai-chatbot-backend.onrender.com",
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
        return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));



// creating routes
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
// using Routes 
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);





module.exports = app;