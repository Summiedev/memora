// routes/friendRoutes.js
const express        = require('express');
const router         = express.Router();
const auth           = require('../middleware/authMiddleware');
const User           = require('../models/user');
const { getIo, onlineUsers } = require('../config/socket');

// GET /api/friends  → confirmed friends list
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username fullname')
      .select('friends');
    res.json(Array.isArray(user?.friends) ? user.friends : []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/friends/pending  → { received: [], sent: [] }
router.get('/pending', auth, async (req, res) => {
  try {
    const uid = String(req.user._id);
    const me = await User.findById(uid)
      .populate('pendingFriendRequests', 'username fullname')
      .select('pendingFriendRequests');

    const received = (me?.pendingFriendRequests || []).map(u => ({
      _id: String(u._id), username: u.username, fullname: u.fullname,
    }));

    const sentUsers = await User.find({ pendingFriendRequests: uid }).select('username fullname');
    const sent = sentUsers.map(u => ({ _id: String(u._id), username: u.username, fullname: u.fullname }));

    res.json({ received, sent });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/friends/request  → send a friend request (REST + socket notify)
router.post('/request', auth, async (req, res) => {
  try {
    const senderId   = String(req.user._id);
    const receiverId = String(req.body.receiverId);
    if (!receiverId) return res.status(400).json({ message: 'receiverId required' });

    await User.findByIdAndUpdate(receiverId, { $addToSet: { pendingFriendRequests: senderId } });

    const sender = await User.findById(senderId).select('username fullname');
    const io = getIo();
    if (io) {
      const destSocket = onlineUsers.get(receiverId);
      if (destSocket) {
        io.to(destSocket).emit('receive_friend_request', {
          fromUser: { _id: senderId, username: sender?.username, fullname: sender?.fullname },
        });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/friends/accept  → accept a friend request
router.post('/accept', auth, async (req, res) => {
  try {
    const toId   = String(req.user._id);   // accepter
    const fromId = String(req.body.fromId); // who sent the request
    if (!fromId) return res.status(400).json({ message: 'fromId required' });

    await Promise.all([
      User.findByIdAndUpdate(fromId, { $addToSet: { friends: toId } }),
      User.findByIdAndUpdate(toId,   { $addToSet: { friends: fromId } }),
      User.findByIdAndUpdate(toId,   { $pull: { pendingFriendRequests: fromId } }),
    ]);

    const accepter  = await User.findById(toId).select('username fullname');
    const requester = await User.findById(fromId).select('username fullname');

    const io = getIo();
    if (io) {
      const reqSocket = onlineUsers.get(fromId);
      if (reqSocket) {
        io.to(reqSocket).emit('friend_request_accepted', {
          fromUser: { _id: toId, username: accepter?.username, fullname: accepter?.fullname },
        });
      }
    }
    res.json({ success: true, newFriend: { _id: fromId, username: requester?.username } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/friends/decline  → decline a friend request
router.post('/decline', auth, async (req, res) => {
  try {
    const toId   = String(req.user._id);
    const fromId = String(req.body.fromId);
    if (!fromId) return res.status(400).json({ message: 'fromId required' });

    await User.findByIdAndUpdate(toId, { $pull: { pendingFriendRequests: fromId } });

    const io = getIo();
    if (io) {
      const reqSocket = onlineUsers.get(fromId);
      if (reqSocket) {
        io.to(reqSocket).emit('friend_request_declined', { fromUser: { _id: toId } });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;