// POST /api/mood
const Mood = require('../models/mood');

exports.postMood = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const mood = await Mood.findOneAndUpdate(
      { userId: req.user.id, date: today },
      { mood: req.body.mood },
      { upsert: true, new: true }
    );

    res.json({ message: 'Mood saved', mood });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving mood' });
  }
}
// GET /api/mood/today
exports.getToodayMood = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const mood = await Mood.findOne({ userId: req.user.id, date: today });
    res.json({ exists: !!mood });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking today’s mood' });
  }
}
// GET /api/mood/week
exports.getWeeklyMood = async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(7);

    const padded = [...Array(7).fill(null)];

    moods.reverse().forEach((entry, idx) => {
      padded[idx] = {
        day: entry.date,
        mood: entry.mood,
      };
    });

    res.json(padded.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching weekly mood' });
  }
}