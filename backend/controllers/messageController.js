
const { getIo, onlineUsers } = require('../config/socket');
const Message = require('../models/message');
 


// POST /api/messages/send  (MUST come before /:chatId to avoid conflict)
exports.sendMessage =  async (req, res) => {
  try {
    const { senderId, receiverId, text, capsuleId, messageType } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'senderId and receiverId required' });
    }
    const chatId  = [String(senderId), String(receiverId)].sort().join('_');
    const msgData = {
      chatId,
      sender:      senderId,
      receiver:    receiverId,
      text:        text || '',
      messageType: messageType || 'text',
    };
    if (capsuleId) msgData.capsuleId = capsuleId;

    const saved = await Message.create(msgData);
    const msg   = await Message.findById(saved._id)
      .populate('sender',   'username fullname')
      .populate('receiver', 'username fullname');

    const io = getIo();
    if (io) {
      const dest = onlineUsers.get(String(receiverId));
      if (dest) io.to(dest).emit('receive_message', msg.toObject());
    }
    res.status(201).json(msg);
  } catch (err) {
    console.error('POST /messages/send:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// GET /api/messages/history/:userId/:friendId
exports.getChatHistory = async (req, res) => {
  try {
    const chatId = [req.params.userId, req.params.friendId].sort().join('_');
    const msgs   = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .populate('sender',   'username fullname')
      .populate('receiver', 'username fullname');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load history' });
  }
};

// GET /api/messages/:chatId  — must be LAST (catches everything else)
exports.readHistory = async (req, res) => {
  try {
    const msgs = await Message.find({ chatId: req.params.chatId })
      .sort({ timestamp: 1 })
      .populate('sender',   'username fullname')
      .populate('receiver', 'username fullname');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
};

