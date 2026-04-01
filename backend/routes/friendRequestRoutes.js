const express = require('express');
const FriendController = require('../controllers/friendRequestController');
const authenticateUser = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/friend-request',          authenticateUser, FriendController.sendFriendRequest);
router.post('/friend-accept',           authenticateUser, FriendController.acceptFriendRequest);
router.get('/friend-requests/:userId',  authenticateUser, FriendController.getFriendRequests);

module.exports = router;