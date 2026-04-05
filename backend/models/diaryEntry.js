const mongoose = require('mongoose');

const DiaryMemorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  date: {
    type: Date
  },
  // Voice note support
  voiceNote: {
    url: { type: String, default: null },
    duration: { type: Number, default: null },
    publicId: { type: String, default: null }
  },
  // Secret / Locked memories
  isSecret: { type: Boolean, default: false },
  pinHash: { type: String, default: null },
  burnAfterReading: { type: Boolean, default: false },
  burnAfterReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Group diary support
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupDiary', default: null },

  sharedWith: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emotionTag: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('DiaryMemory', DiaryMemorySchema);
