const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatId:      { type: String, required: true, index: true },
  sender:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:        { type: String, default: '' },
  capsuleId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Capsule', default: null },
  messageType: { type: String, enum: ['text', 'capsule_share'], default: 'text' },
  read:        { type: Boolean, default: false },
  timestamp:   { type: Date, default: Date.now },
}, { timestamps: false });

// Index for fast chat history lookups
MessageSchema.index({ chatId: 1, timestamp: 1 });

module.exports = mongoose.model('Message', MessageSchema);