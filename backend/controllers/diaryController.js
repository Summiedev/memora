const bcrypt = require('bcryptjs');
const DiaryMemory = require('../models/diaryEntry.js');
const Streak = require('../models/streak.js');

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
    const {
      title, entryText, date, emotionTag,
      isSecret, pin, burnAfterReading,
      voiceNoteUrl, voiceNoteDuration, voiceNotePublicId,
      groupId
    } = req.body;

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

    res.status(201).json({ success: true, data: diary, streak });
  } catch (error) {
    console.error('createDiaryMemory:', error);
    res.status(500).json({ success: false, message: 'Failed to create diary', error });
  }
};

// ─── Get my diary memories ───────────────────────────────────────────────────
const getMyDiaryMemories = async (req, res) => {
  try {
    const diaries = await DiaryMemory.find({
      createdBy: req.user._id,
      groupId: null  // personal only
    }).sort({ createdAt: -1 }).select('-pinHash');

    res.json({ success: true, data: diaries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch diaries', error });
  }
};

// ─── Get shared diary memories ───────────────────────────────────────────────
const getSharedDiaryMemories = async (req, res) => {
  try {
    const sharedDiaries = await DiaryMemory.find({
      sharedWith: req.user._id
    }).sort({ createdAt: -1 }).select('-pinHash');

    res.json({ success: true, data: sharedDiaries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch shared diaries', error });
  }
};

// ─── Get a specific diary memory ─────────────────────────────────────────────
const getDiaryMemoryById = async (req, res) => {
  try {
    const diary = await DiaryMemory.findById(req.params.memoryId).select('-pinHash');
    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });

    const userId = req.user._id.toString();
    const isOwner  = diary.createdBy.toString() === userId;
    const isShared = diary.sharedWith.map(id => id.toString()).includes(userId);

    if (!isOwner && !isShared) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Secret entry: return locked flag unless owner provided PIN
    if (diary.isSecret && !isOwner) {
      return res.status(403).json({ success: false, message: 'This entry is secret' });
    }

    // Burn after reading
    if (diary.burnAfterReading && !isOwner) {
      const alreadyRead = diary.burnAfterReadBy.map(id => id.toString()).includes(userId);
      const diaryObj = diary.toObject();
      if (!alreadyRead) {
        diary.burnAfterReadBy.push(req.user._id);
        await diary.save();
      }
      // delete after returning to non-owner readers
      const response = res.json({ success: true, data: diaryObj, burnedAfterRead: true });
      if (alreadyRead) {
        await diary.deleteOne();
      }
      return response;
    }

    res.json({ success: true, data: diary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch diary', error });
  }
};

// ─── Unlock secret entry with PIN ────────────────────────────────────────────
const unlockSecretDiary = async (req, res) => {
  try {
    const { pin } = req.body;
    const diary = await DiaryMemory.findById(req.params.memoryId);
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

    const diaryObj = diary.toObject();
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
    const diary = await DiaryMemory.findById(req.params.memoryId);

    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });
    if (diary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this diary' });
    }

    if (title)      diary.title = title;
    if (content)    diary.content = content;
    if (emotionTag !== undefined) diary.emotionTag = emotionTag;
    if (voiceNoteUrl) {
      diary.voiceNote = {
        url: voiceNoteUrl,
        duration: voiceNoteDuration || null,
        publicId: voiceNotePublicId || null
      };
    }

    await diary.save();
    const diaryObj = diary.toObject();
    delete diaryObj.pinHash;
    res.json({ success: true, data: diaryObj });
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
    const diary = await DiaryMemory.findById(req.params.memoryId);

    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });
    if (diary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to share this diary' });
    }

    userIds.forEach(id => {
      if (!diary.sharedWith.map(s => s.toString()).includes(id)) {
        diary.sharedWith.push(id);
      }
    });

    await diary.save();
    const diaryObj = diary.toObject();
    delete diaryObj.pinHash;
    res.json({ success: true, data: diaryObj });
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

    // Find all entries by this user created on same month+day in previous years
    const allDiaries = await DiaryMemory.find({
      createdBy: req.user._id
    }).select('-pinHash').sort({ createdAt: -1 });

    const onThisDay = allDiaries.filter(d => {
      const created = new Date(d.createdAt);
      return (
        created.getMonth() + 1 === month &&
        created.getDate()       === day  &&
        created.getFullYear()   < now.getFullYear()
      );
    });

    // Attach emotional context messages
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
      ...d.toObject(),
      emotionContext: d.emotionTag
        ? (emotionContextMap[d.emotionTag] || `Feeling ${d.emotionTag} on this day.`)
        : "A memory from this day in the past. 📅",
      yearsAgo: now.getFullYear() - new Date(d.createdAt).getFullYear()
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch On This Day', error });
  }
};

// ─── Get streak ───────────────────────────────────────────────────────────────
const getStreak = async (req, res) => {
  try {
    const streak = await Streak.findOne({ userId: req.user._id });
    if (!streak) return res.json({ success: true, data: { currentStreak: 0, longestStreak: 0, totalEntries: 0, lastEntryDate: null } });
    res.json({ success: true, data: streak });
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
