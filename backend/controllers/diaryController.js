const { z } = require('zod');
const bcrypt = require('bcryptjs');
const DiaryMemory = require('../models/diaryEntry.js');
const Streak = require('../models/streak.js');
const { DiaryDTO, StreakDTO } = require('../utils/response');
const logger = require('../utils/logger');
const { createDiaryBody, updateDiaryBody, unlockDiaryBody, shareDiaryBody, diaryParams, pagination } = require('../utils/schemas');

// ─── Streak helper ───────────────────────────────────────────────────────────
const toDateStr = (d) => d.toISOString().split('T')[0]; // YYYY-MM-DD

async function updateStreak(userId) {
  const today = toDateStr(new Date());
  let streak = await Streak.findOne({ userId });

  if (!streak) {
    streak = new Streak({ userId, currentStreak: 1, longestStreak: 1, lastEntryDate: today, totalEntries: 1 });
    await streak.save();
    return streak;
  }

  streak.totalEntries += 1;

  if (streak.lastEntryDate === today) {
    // already logged today — no streak change, just increment total
  } else {
    const yesterday = toDateStr(new Date(Date.now() - 86400000));
    if (streak.lastEntryDate === yesterday) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1; // reset
    }
    streak.lastEntryDate = today;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
  }

  await streak.save();
  return streak;
}

// ─── Create diary memory ─────────────────────────────────────────────────────
const createDiaryMemory = async (req, res) => {
  try {
    const parsed = createDiaryBody.parse(req.body);
    const {
      title, entryText, date, emotionTag,
      isSecret, pin, burnAfterReading,
      voiceNoteUrl, voiceNoteDuration, voiceNotePublicId,
      groupId
    } = parsed;

    let pinHash = null;
    if (isSecret && pin) {
      pinHash = await bcrypt.hash(String(pin), 10);
    }

    const diary = await DiaryMemory.create({
      title,
      content: entryText || '',
      date: date ? new Date(date) : undefined,
      emotionTag: emotionTag || null,
      isSecret: !!isSecret,
      pinHash,
      burnAfterReading: !!burnAfterReading,
      voiceNote: {
        url: voiceNoteUrl || null,
        duration: voiceNoteDuration || null,
        publicId: voiceNotePublicId || null
      },
      groupId: groupId || null,
      createdBy: req.user._id
    });

    // Update streak
    const streak = await updateStreak(req.user._id);

res.status(201).json({ success: true, data: DiaryDTO(diary.toObject()), streak: StreakDTO(streak.toObject()) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to create diary', error });
  }
 };

// ─── Get my diary memories ───────────────────────────────────────────────────
const getMyDiaryMemories = async (req, res) => {
  try {
    const parsed = pagination.parse(req.query);
    const page = Math.max(1, parsed.page);
    const limit = Math.min(50, parsed.limit);
    const skip = (page - 1) * limit;

    const [diaries, total] = await Promise.all([
      DiaryMemory.find({ createdBy: req.user._id, groupId: null })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-pinHash')
        .lean(),
      DiaryMemory.countDocuments({ createdBy: req.user._id, groupId: null })
    ]);

res.json({ success: true, data: diaries, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch diaries', error });
  }
 };

// ─── Get shared diary memories ───────────────────────────────────────────────
const getSharedDiaryMemories = async (req, res) => {
  try {
    const parsed = pagination.parse(req.query);
    const page = Math.max(1, parsed.page);
    const limit = Math.min(50, parsed.limit);
    const skip = (page - 1) * limit;

    const [sharedDiaries, total] = await Promise.all([
      DiaryMemory.find({ sharedWith: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-pinHash')
        .lean(),
      DiaryMemory.countDocuments({ sharedWith: req.user._id })
    ]);

res.json({ success: true, data: sharedDiaries, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch shared diaries', error });
  }
 };

// ─── Get a specific diary memory ─────────────────────────────────────────────
const getDiaryMemoryById = async (req, res) => {
  try {
    const diary = await DiaryMemory.findById(req.params.memoryId).select('-pinHash').lean();
    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });

    const userId = req.user._id.toString();
    const isOwner  = diary.createdBy.toString() === userId;
    const isShared = diary.sharedWith.map(id => id.toString()).includes(userId);

    if (!isOwner && !isShared) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    if (diary.isSecret && !isOwner) {
      return res.status(403).json({ success: false, message: 'This entry is secret' });
    }

    if (diary.burnAfterReading && !isOwner) {
      const alreadyRead = diary.burnAfterReadBy.map(id => id.toString()).includes(userId);
      if (!alreadyRead) {
        await DiaryMemory.findByIdAndUpdate(req.params.memoryId, { $addToSet: { burnAfterReadBy: req.user._id } });
      }
      const burned = alreadyRead;
      if (burned) {
        await DiaryMemory.findByIdAndDelete(req.params.memoryId);
      }
      return res.json({ success: true, data: DiaryDTO(diary), burnedAfterRead: true });
    }

    res.json({ success: true, data: DiaryDTO(diary) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch diary', error });
  }
};

// ─── Unlock secret entry with PIN ────────────────────────────────────────────
const unlockSecretDiary = async (req, res) => {
  try {
    const { pin } = req.body;
    const diary = await DiaryMemory.findById(req.params.memoryId).lean();
    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });

    const userId = req.user._id.toString();
    const isOwner  = diary.createdBy.toString() === userId;
    const isShared = diary.sharedWith.map(id => id.toString()).includes(userId);

    if (!isOwner && !isShared) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!diary.isSecret || !diary.pinHash) {
      return res.status(400).json({ success: false, message: 'Entry is not PIN-locked' });
    }

    const match = await bcrypt.compare(String(pin), diary.pinHash);
    if (!match) return res.status(401).json({ success: false, message: 'Incorrect PIN' });

    const diaryObj = DiaryDTO(diary);
    delete diaryObj.pinHash;
    res.json({ success: true, data: diaryObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unlock diary', error });
  }
};

// ─── Update diary memory ──────────────────────────────────────────────────────
const updateDiaryMemory = async (req, res) => {
  try {
    const { title, content, emotionTag, voiceNoteUrl, voiceNoteDuration, voiceNotePublicId } = req.body;
    const diary = await DiaryMemory.findById(req.params.memoryId).lean();
    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });
    if (diary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this diary' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (emotionTag !== undefined) updates.emotionTag = emotionTag;
    if (voiceNoteUrl) {
      updates.voiceNote = {
        url: voiceNoteUrl,
        duration: voiceNoteDuration || null,
        publicId: voiceNotePublicId || null
      };
    }

    const updated = await DiaryMemory.findByIdAndUpdate(req.params.memoryId, { $set: updates }, { new: true }).select('-pinHash').lean();
    res.json({ success: true, data: DiaryDTO(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update diary', error });
  }
};

// ─── Delete diary ─────────────────────────────────────────────────────────────
const deleteDiaryMemory = async (req, res) => {
  try {
    const diary = await DiaryMemory.findById(req.params.memoryId);
    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });
    if (diary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this diary' });
    }
    await diary.deleteOne();
    res.json({ success: true, message: 'Diary deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete diary', error });
  }
};

// ─── Share diary with users ───────────────────────────────────────────────────
const shareDiaryWithUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const diary = await DiaryMemory.findById(req.params.memoryId).lean();
    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });
    if (diary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to share this diary' });
    }

    const uniqueIds = [...new Set([...diary.sharedWith.map(id => id.toString()), ...userIds.map(id => id.toString())])];
    const updated = await DiaryMemory.findByIdAndUpdate(req.params.memoryId, { $set: { sharedWith: uniqueIds } }, { new: true }).select('-pinHash').lean();
    res.json({ success: true, data: DiaryDTO(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to share diary', error });
  }
};

// ─── "On This Day" nostalgia engine ──────────────────────────────────────────
const getOnThisDay = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day   = now.getDate();
    const currentYear = now.getFullYear();

    const onThisDay = await DiaryMemory.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $addFields: {
          entryMonth: { $month: '$createdAt' },
          entryDay:   { $dayOfMonth: '$createdAt' },
          entryYear:  { $year: '$createdAt' }
        }
      },
      {
        $match: {
          entryMonth: month,
          entryDay:   day,
          entryYear:  { $lt: currentYear }
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      { $project: { pinHash: 0, entryMonth: 0, entryDay: 0, entryYear: 0 } }
    ]);

    const emotionContextMap = {
      happy:    "You were beaming with joy here — carry that energy forward! ☀️",
      sad:      "This was a tough day — look how far you've come. 💪",
      anxious:  "You were feeling anxious here — look how far you've come. 🌱",
      excited:  "Pure excitement radiating from this memory! ✨",
      grateful: "You were counting your blessings — beautiful. 🙏",
      angry:    "A stormy day, but you got through it. 🌈",
      neutral:  "Just an ordinary day — those are precious too. 🌿"
    };

    const enriched = onThisDay.map(d => ({
      ...d,
      emotionContext: d.emotionTag
        ? (emotionContextMap[d.emotionTag] || `Feeling ${d.emotionTag} on this day.`)
        : "A memory from this day in the past. 📅",
      yearsAgo: currentYear - d.createdAt.getFullYear()
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch On This Day', error });
  }
};

// ─── Get streak ───────────────────────────────────────────────────────────────
const getStreak = async (req, res) => {
  try {
    const streak = await Streak.findOne({ userId: req.user._id }).lean();
    if (!streak) return res.json({ success: true, data: { currentStreak: 0, longestStreak: 0, totalEntries: 0, lastEntryDate: null } });
    res.json({ success: true, data: StreakDTO(streak) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch streak', error });
  }
};

module.exports = {
  createDiaryMemory,
  getMyDiaryMemories,
  getSharedDiaryMemories,
  getDiaryMemoryById,
  unlockSecretDiary,
  updateDiaryMemory,
  deleteDiaryMemory,
  shareDiaryWithUsers,
  getOnThisDay,
  getStreak
};
