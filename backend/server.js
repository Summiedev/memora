// const express = require('express');
// const http = require('http');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const passport = require('passport');
// const cors = require('cors');
// const User = require("./models/user"); 
// const { Server } = require("socket.io");

// // Load env variables
// dotenv.config();

// // Initialize DB and Passport
// require('./config/db')(); // Connect to MongoDB
// require('./config/passport'); // Passport strategy config

// // Express app
// const app = express();
// const server = http.createServer(app); // Create HTTP server

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(passport.initialize());

// // Routes
// app.use('/api', require('./routes')); // API route handlers

// // Socket.IO setup
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Your React frontend URL
//     methods: ["GET", "POST"],
//   },
// });

// // In-memory map to store online users
// const onlineUsers = new Map();

// // Handle socket connections
// io.on("connection", (socket) => {
//   console.log("New client connected:", socket.id);

//   // Register user when connected
//   socket.on("register", (userId) => {
//     onlineUsers.set(userId, socket.id);
//     console.log(`User ${userId} registered with socket ID ${socket.id}`);
//   });

//   // Handle sending messages
// socket.on("send_message", ({ senderId, receiverId, text, timestamp }) => {
//   const destSock = onlineUsers.get(receiverId);
//   if (destSock) {
//     io.to(destSock).emit("receive_message", { senderId, text, timestamp });
//   }
// });

//   // Handle friend request notifications
//   socket.on("accept_friend_request", async ({ fromId, toId }) => {
//     console.log(`User ${toId} accepted friend request from ${fromId}`);

//     try {
//       // a) Update both users' friend lists
//       await Promise.all([
//         User.findByIdAndUpdate(fromId, {  $addToSet: { friends: toId } }),
//         User.findByIdAndUpdate(toId,   {  $addToSet: { friends: fromId } })
//       ]);

//       // b) Load accepter’s username for the payload
//       const accepter = await User.findById(toId).select("username");

//       // c) Notify the original sender
//       const senderSock = onlineUsers.get(fromId);
//       if (senderSock) {
//         io.to(senderSock).emit("friend_request_accepted", {
//           fromUser: { _id: toId, username: accepter.username }
//         });
//         console.log(`→ Emitted friend_request_accepted to socket ${senderSock}`);
//       }
//     } catch (err) {
//       console.error("Error in accept_friend_request:", err);
//       socket.emit("error", { message: "Unable to accept friend request" });
//     }
//   });







//   // Cleanup on disconnect
//   socket.on("disconnect", () => {
//     for (const [userId, socketId] of onlineUsers.entries()) {
//       if (socketId === socket.id) {
//         onlineUsers.delete(userId);
//         break;
//       }
//     }
//     console.log("Client disconnected:", socket.id);
//   });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server with Socket.IO running on port ${PORT}`));
// server.js
// server.js
const express  = require('express');
const http     = require('http');
const dotenv   = require('dotenv');
const cors     = require('cors');
const passport = require('passport');
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const { initSocket } = require('./config/socket');

dotenv.config();

// Connect to MongoDB
require('./config/db')();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Passport strategies
require('./config/passport');

const app    = express();
const server = http.createServer(app);


app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// CSRF protection - only generate tokens, don't block requests yet
const csrfProtection = csrf({ cookie: true });

// Route to get CSRF token (no validation, only generation)
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api', require('./routes'));


app.use(require('./middleware/errorHandler'));

// Initialize Socket.IO
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT,'0.0.0.0', () => console.log(`🚀 Server with Socket.IO running on port ${PORT}`));