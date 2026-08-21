const { z } = require('zod');
const User = require('../models/user');
const { getIo, onlineUsers } = require('../config/socket');
const { FriendDTO } = require('../utils/response');
const logger = require('../utils/logger');
const { friendRequestBody, acceptFriendBody, declineFriendBody } = require('../utils/schemas');

// POST /api/friend-requests/friend-request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = friendRequestBody.parse(req.body);
    const senderId = String(req.user._id);

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { pendingFriendRequests: senderId },
    });

    const sender = await User.findById(senderId).select('username fullname').lean();
    const io = getIo();
    if (io) {
      const destSocket = onlineUsers.get(receiverId);
      if (destSocket && sender) {
        io.to(destSocket).emit('receive_friend_request', {
          fromUser: { _id: senderId, username: sender.username, fullname: sender.fullname },
        });
      }
    }

    res.json({ success: true, message: 'Friend request sent' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    logger.error(err, 'sendFriendRequest error');
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/friend-requests/friend-accept
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { fromId } = acceptFriendBody.parse(req.body);
    const toId = String(req.user._id);

    if (fromId === toId) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    await Promise.all([
      User.findByIdAndUpdate(fromId, { $addToSet: { friends: toId } }),
      User.findByIdAndUpdate(toId,   { $addToSet: { friends: fromId } }),
      User.findByIdAndUpdate(toId,   { $pull: { pendingFriendRequests: fromId } }),
    ]);

    const [accepter, requester] = await Promise.all([
      User.findById(toId).select('username fullname').lean(),
      User.findById(fromId).select('username fullname').lean(),
    ]);

    const io = getIo();
    if (io) {
      const destSocket = onlineUsers.get(fromId);
      if (destSocket && accepter) {
        io.to(destSocket).emit('friend_request_accepted', {
          fromUser: { _id: toId, username: accepter.username, fullname: accepter.fullname },
        });
      }
    }

    res.json({ success: true, message: 'Friend request accepted', newFriend: FriendDTO(requester) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    logger.error(err, 'acceptFriendRequest error');
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/friend-requests/friend-requests
exports.getFriendRequests = async (req, res) => {
  try {
    const userId = String(req.user._id);

    const [user, sentUsers] = await Promise.all([
      User.findById(userId)
        .select('friends pendingFriendRequests')
        .populate('friends',               'username fullname avatar')
        .populate('pendingFriendRequests', 'username fullname avatar')
        .lean(),
      User.find({ pendingFriendRequests: userId }).select('username fullname').lean(),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      friends:         user.friends.map(FriendDTO),
      pendingReceived: user.pendingFriendRequests.map((f) => ({ _id: String(f._id), username: f.username })),
      pendingSent:     sentUsers.map((f) => ({ _id: String(f._id), username: f.username, fullname: f.fullname })),
    });
  } catch (err) {
    logger.error(err, 'getFriendRequests error');
    res.status(500).json({ error: 'Unable to fetch friend data' });
  }
};
