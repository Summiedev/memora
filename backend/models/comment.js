const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  capsuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Capsule',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

commentSchema.index({ capsuleId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
