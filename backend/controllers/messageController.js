const { getIo, onlineUsers } = require('../config/socket');
const Message = require('../models/message'); // Adjust the path as needed
const User = require('../models/user'); // Adjust the path as needed

exports.getChatHistory = async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const chatId = [userId, friendId].sort().join("_");
    const messages = await Message.find({ chatId }).sort("timestamp");
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load chat history" });
  }
};

exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, text, capsuleId } = req.body;

  try {
    const chatId = [senderId, receiverId].sort().join("_");
    const messageData = { chatId, sender: senderId, receiver: receiverId, text };
    if (capsuleId) messageData.capsuleId = capsuleId;

    const message = await Message.create(messageData);

    // Emit message to receiver if online
    const io = getIo();
    const receiverSocketId = onlineUsers.get(String(receiverId));

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", message);
    }

    res.json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
  
exports.readHistory =async (req, res) => {
 try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .sort("timestamp")
      .populate("sender", "username")
      .populate("receiver", "username");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages." });
  }
}
;
