// models/Mood.js
const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  date: {
    type: String, // format: YYYY-MM-DD
    required: true,
  }
}, { timestamps: true });

MoodSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Mood', MoodSchema);
