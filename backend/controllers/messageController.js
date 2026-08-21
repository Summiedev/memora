const { z } = require('zod');
const { getIo, onlineUsers } = require('../config/socket');
const Message = require('../models/message');
const DiaryMemory = require('../models/diaryEntry');
const PhotoAlbum = require('../models/photoAlbum');
const User = require('../models/user');
const Capsule = require('../models/capsule');
const { MessageDTO } = require('../utils/response');
const logger = require('../utils/logger');
const { sendMessageBody, messageQuery, messageParams, chatIdParam } = require('../utils/schemas');

// POST /api/messages/message
exports.sendMessage = async (req, res) => {
  try {
    const parsed = sendMessageBody.parse(req.body);
    const { receiverId, text, capsuleId, memoryId, memoryType, messageType } = parsed;
    const senderId = String(req.user._id);
    const chatId = [senderId, String(receiverId)].sort().join('_');
    const msgData = {
      chatId,
      sender:      senderId,
      receiver:    String(receiverId),
      text:        text || '',
      messageType: messageType || 'text',
    };
    if (capsuleId)  msgData.capsuleId  = capsuleId;
    if (memoryId)   msgData.memoryId   = memoryId;
    if (memoryType) msgData.memoryType = memoryType;

    const saved = await Message.create(msgData);

    const [sender, receiver, capsule] = await Promise.all([
      User.findById(saved.sender).select('username fullname').lean(),
      User.findById(saved.receiver).select('username fullname').lean(),
      saved.capsuleId ? Capsule.findById(saved.capsuleId).select('title coverImage').lean() : Promise.resolve(null)
    ]);

    let msgObj = saved.toObject();
    msgObj.sender = sender;
    msgObj.receiver = receiver;
    if (capsule) msgObj.capsuleId = capsule;

    let memoryPreview = null;
    if (memoryId && memoryType) {
      if (memoryType === 'DiaryMemory') {
        memoryPreview = await DiaryMemory.findById(memoryId).select('title content emotionTag').lean();
      } else if (memoryType === 'PhotoAlbum') {
        memoryPreview = await PhotoAlbum.findById(memoryId).select('title photos').lean();
      }
    }

    if (memoryPreview) msgObj.memoryPreview = memoryPreview;

    const io = getIo();
    if (io) {
      const dest = onlineUsers.get(String(receiverId));
      if (dest) io.to(dest).emit('receive_message', MessageDTO(msgObj));
    }
    res.status(201).json(MessageDTO(msgObj));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// GET /api/messages/history/:userId/:friendId
exports.getChatHistory = async (req, res) => {
  try {
    const parsedParams = messageParams.parse(req.params);
    const parsedQuery = messageQuery.parse(req.query);
    const currentUserId = String(req.user._id);
    const targetUserId = String(parsedParams.userId);
    const friendId = String(parsedParams.friendId);

    const participants = [targetUserId, friendId].sort();
    if (!participants.includes(currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to access this chat' });
    }

    const chatId = participants.join('_');
    const limit = parsedQuery.limit;
    const before = parsedQuery.before ? new Date(parsedQuery.before) : null;

    const query = { chatId };
    if (before) query.timestamp = { $lt: before };

    const msgs = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(limit + 1)
      .populate('sender',   'username fullname')
      .populate('receiver', 'username fullname')
      .populate('capsuleId', 'title coverImage')
      .lean();

    const hasMore = msgs.length > limit;
    const trimmed = hasMore ? msgs.slice(0, limit) : msgs;
    const oldestTimestamp = trimmed.length > 0 ? trimmed[trimmed.length - 1].timestamp : null;

    res.json({ messages: trimmed.reverse().map(MessageDTO), hasMore, oldestTimestamp });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to load history' });
  }
};

// GET /api/messages/:chatId
exports.readHistory = async (req, res) => {
  try {
    const parsedParams = chatIdParam.parse(req.params);
    const parsedQuery = messageQuery.parse(req.query);
    const currentUserId = String(req.user._id);
    const chatId = String(parsedParams.chatId);
    const participants = chatId.split('_');

    if (!participants.includes(currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to access this chat' });
    }

    const limit = parsedQuery.limit;
    const before = parsedQuery.before ? new Date(parsedQuery.before) : null;

    const query = { chatId };
    if (before) query.timestamp = { $lt: before };

    const msgs = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(limit + 1)
      .populate('sender',   'username fullname')
      .populate('receiver', 'username fullname')
      .populate('capsuleId', 'title coverImage')
      .lean();

    const hasMore = msgs.length > limit;
    const trimmed = hasMore ? msgs.slice(0, limit) : msgs;
    const oldestTimestamp = trimmed.length > 0 ? trimmed[trimmed.length - 1].timestamp : null;

    res.json({ messages: trimmed.reverse().map(MessageDTO), hasMore, oldestTimestamp });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to read messages' });
  }
};
