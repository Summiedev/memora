// POST /api/mood
const { z } = require('zod');
const Mood = require('../models/mood');
const { MoodDTO } = require('../utils/response');
const logger = require('../utils/logger');
const { moodQuery } = require('../utils/schemas');

exports.postMood = async (req, res) => {
  try {
    const { mood } = moodQuery.parse(req.body);
    const today = new Date().toISOString().split('T')[0];

    const saved = await Mood.findOneAndUpdate(
      { userId: req.user.id, date: today },
      { mood },
      { upsert: true, new: true }
    ).lean();

    res.json({ message: 'Mood saved', mood: MoodDTO(saved) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    logger.error(err, 'Server error saving mood');
    res.status(500).json({ error: 'Server error saving mood' });
  }
};

// GET /api/mood/today
exports.getToodayMood = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const mood = await Mood.findOne({ userId: req.user.id, date: today }).lean();
    res.json({ exists: !!mood });
  } catch (err) {
    logger.error(err, 'Error checking today\'s mood');
    res.status(500).json({ error: 'Error checking today\'s mood' });
  }
};

// GET /api/mood/week
exports.getWeeklyMood = async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    const padded = [...Array(7).fill(null)];

    moods.reverse().forEach((entry, idx) => {
      padded[idx] = {
        day: entry.date,
        mood: entry.mood,
      };
    });

    res.json(padded.reverse());
  } catch (err) {
    logger.error(err, 'Error fetching weekly mood');
    res.status(500).json({ error: 'Error fetching weekly mood' });
  }
};
