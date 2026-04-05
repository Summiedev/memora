const { getIo, onlineUsers } = require('../config/socket');
const Message = require('../models/message');
const DiaryMemory = require('../models/diaryEntry');
const PhotoAlbum = require('../models/photoAlbum');

// POST /api/messages/message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text, capsuleId, memoryId, memoryType, messageType } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'senderId and receiverId required' });
    }

    const chatId = [String(senderId), String(receiverId)].sort().join('_');
    const msgData = {
      chatId,
      sender:      senderId,
      receiver:    receiverId,
      text:        text || '',
      messageType: messageType || 'text',
    };
    if (capsuleId)  msgData.capsuleId  = capsuleId;
    if (memoryId)   msgData.memoryId   = memoryId;
    if (memoryType) msgData.memoryType = memoryType;

    const saved = await Message.create(msgData);
    const msg   = await Message.findById(saved._id)
      .populate('sender',   'username fullname')
      .populate('receiver', 'username fullname')
      .populate('capsuleId', 'title coverImage');

    // If memory share, attach preview
    let memoryPreview = null;
    if (memoryId && memoryType) {
      if (memoryType === 'DiaryMemory') {
        memoryPreview = await DiaryMemory.findById(memoryId).select('title content emotionTag').lean();
      } else if (memoryType === 'PhotoAlbum') {
        memoryPreview = await PhotoAlbum.findById(memoryId).select('title photos').lean();
      }
    }

    const msgObj = msg.toObject();
    if (memoryPreview) msgObj.memoryPreview = memoryPreview;

    const io = getIo();
    if (io) {
      const dest = onlineUsers.get(String(receiverId));
      if (dest) io.to(dest).emit('receive_message', msgObj);
    }
    res.status(201).json(msgObj);
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
      .populate('receiver', 'username fullname')
      .populate('capsuleId', 'title coverImage');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load history' });
  }
};

// GET /api/messages/:chatId
exports.readHistory = async (req, res) => {
  try {
    const msgs = await Message.find({ chatId: req.params.chatId })
      .sort({ timestamp: 1 })
      .populate('sender',   'username fullname')
      .populate('receiver', 'username fullname')
      .populate('capsuleId', 'title coverImage');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
};
