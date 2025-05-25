const express = require('express');
const FriendController = require('../controllers/friendRequestController');
const authenticateUser = require('../middleware/authMiddleware');

const router = express.Router();

// Send a friend request
router.post("/friend-request",authenticateUser, FriendController.sendFriendRequest);

// Accept a friend request
router.post("/friend-accept", authenticateUser, FriendController.acceptFriendRequest);

// Get all friend requests for a user
router.get("/friend-requests/:userId", authenticateUser, FriendController.getFriendRequests);

module.exports = router;