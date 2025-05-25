const FriendRequest = require("../models/friendRequest");
const User = require("../models/user");
const { getIo, onlineUsers } = require('../config/socket');
exports.sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const request = await FriendRequest.create({ sender: senderId, receiver: receiverId });

    // Emit friend request to receiver if online
    const io = getIo();
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('friendRequest', {
        senderId,
        requestId: request._id,
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  const { requestId } = req.body;

  const request = await FriendRequest.findById(requestId);
  if (!request) return res.status(404).json({ message: "Request not found" });

  request.status = "accepted";
  await request.save();

  await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
  await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });

  res.json({ message: "Friend added" });
};

exports.getFriendRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Fetch the user, populate their friends and incoming requests
    const user = await User.findById(userId)
      .select('friends pendingFriendRequests')
      .populate('friends', 'username')                     // confirmed friends
      .populate('pendingFriendRequests', 'username');      // incoming

    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2️⃣ Find all users who have this userId in THEIR pendingFriendRequests
    //     → these are the outgoing requests YOU’ve sent
    const sent = await User.find({ pendingFriendRequests: userId })
      .select('username');  

    // 3️⃣ Format the three lists
    const friends = user.friends.map(f => ({ _id: f._id, username: f.username }));
    const pendingReceived = user.pendingFriendRequests.map(f => ({ _id: f._id, username: f.username }));
    const pendingSent = sent.map(f => ({ _id: f._id, username: f.username }));

    // 4️⃣ Send them back
    res.json({ friends, pendingReceived, pendingSent });
  } catch (err) {
    console.error("Error in getFriendRequests:", err);
    res.status(500).json({ error: 'Unable to fetch friend data' });
  }
};