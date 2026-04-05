const mongoose = require('mongoose');

const GroupDiarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['friends', 'school', 'couple', 'family', 'custom'],
    default: 'custom'
  },
  coverEmoji: { type: String, default: '📖' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  inviteCode: { type: String, unique: true, sparse: true }
}, { timestamps: true });

module.exports = mongoose.model('GroupDiary', GroupDiarySchema);
