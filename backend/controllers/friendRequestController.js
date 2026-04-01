const FriendRequest = require("../models/friendRequest");
// const User = require("../models/user");
// const { getIo, onlineUsers } = require('../config/socket');
// exports.sendFriendRequest = async (req, res) => {
//   const { senderId, receiverId } = req.body;

//   try {
//     const request = await FriendRequest.create({ sender: senderId, receiver: receiverId });

//     // Emit friend request to receiver if online
//     const io = getIo();
//     const receiverSocketId = onlineUsers.get(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit('friendRequest', {
//         senderId,
//         requestId: request._id,
//       });
//     }

//     res.json(request);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.acceptFriendRequest = async (req, res) => {
//   const { requestId } = req.body;

//   const request = await FriendRequest.findById(requestId);
//   if (!request) return res.status(404).json({ message: "Request not found" });

//   request.status = "accepted";
//   await request.save();

//   await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
//   await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });

//   res.json({ message: "Friend added" });
// };

// exports.getFriendRequests = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // 1️⃣ Fetch the user, populate their friends and incoming requests
//     const user = await User.findById(userId)
//       .select('friends pendingFriendRequests')
//       .populate('friends', 'username')                     // confirmed friends
//       .populate('pendingFriendRequests', 'username');      // incoming

//     if (!user) return res.status(404).json({ error: 'User not found' });

//     // 2️⃣ Find all users who have this userId in THEIR pendingFriendRequests
//     //     → these are the outgoing requests YOU’ve sent
//     const sent = await User.find({ pendingFriendRequests: userId })
//       .select('username');  

//     // 3️⃣ Format the three lists
//     const friends = user.friends.map(f => ({ _id: f._id, username: f.username }));
//     const pendingReceived = user.pendingFriendRequests.map(f => ({ _id: f._id, username: f.username }));
//     const pendingSent = sent.map(f => ({ _id: f._id, username: f.username }));

//     // 4️⃣ Send them back
//     res.json({ friends, pendingReceived, pendingSent });
//   } catch (err) {
//     console.error("Error in getFriendRequests:", err);
//     res.status(500).json({ error: 'Unable to fetch friend data' });
//   }
// };


const User = require('../models/user');
const { getIo, onlineUsers } = require('../config/socket');

// POST /api/friend-requests/friend-request
// REST fallback — the frontend primarily uses socket events, but this is here for resilience
exports.sendFriendRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'senderId and receiverId are required' });
    }

    // Add senderId into receiver's pendingFriendRequests (idempotent)
    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { pendingFriendRequests: senderId },
    });

    // Attempt real-time notification
    const io = getIo();
    if (io) {
      const sender     = await User.findById(senderId).select('username');
      const destSocket = onlineUsers.get(String(receiverId));
      if (destSocket && sender) {
        io.to(destSocket).emit('receive_friend_request', {
          fromUser: { _id: senderId, username: sender.username },
        });
      }
    }

    res.json({ success: true, message: 'Friend request sent' });
  } catch (err) {
    console.error('sendFriendRequest error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/friend-requests/friend-accept
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { fromId, toId } = req.body;   // fromId = who sent, toId = current user accepting
    if (!fromId || !toId) {
      return res.status(400).json({ message: 'fromId and toId are required' });
    }

    await Promise.all([
      User.findByIdAndUpdate(fromId, { $addToSet: { friends: toId } }),
      User.findByIdAndUpdate(toId,   { $addToSet: { friends: fromId } }),
      User.findByIdAndUpdate(toId,   { $pull: { pendingFriendRequests: fromId } }),
    ]);

    // Notify the original sender that request was accepted
    const io = getIo();
    if (io) {
      const accepter   = await User.findById(toId).select('username');
      const destSocket = onlineUsers.get(String(fromId));
      if (destSocket && accepter) {
        io.to(destSocket).emit('friend_request_accepted', {
          fromUser: { _id: toId, username: accepter.username },
        });
      }
    }

    res.json({ success: true, message: 'Friend request accepted' });
  } catch (err) {
    console.error('acceptFriendRequest error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/friend-requests/friend-requests/:userId
exports.getFriendRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('friends pendingFriendRequests')
      .populate('friends',               'username fullname avatar')
      .populate('pendingFriendRequests', 'username fullname avatar');

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Outgoing: users who have THIS userId in their pendingFriendRequests
    const sentUsers = await User.find({ pendingFriendRequests: userId }).select('username fullname');

    res.json({
      friends:         user.friends.map(f => ({ _id: f._id, username: f.username, fullname: f.fullname })),
      pendingReceived: user.pendingFriendRequests.map(f => ({ _id: f._id, username: f.username })),
      pendingSent:     sentUsers.map(f => ({ _id: f._id, username: f.username })),
    });
  } catch (err) {
    console.error('getFriendRequests error:', err);
    res.status(500).json({ error: 'Unable to fetch friend data' });
  }
};