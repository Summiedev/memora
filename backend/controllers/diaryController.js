const DiaryMemory = require('../models/diaryEntry.js');

// Create a diary memory
const createDiaryMemory = async (req, res) => {
  try {
    const { title, entryText } = req.body;

const diary = await DiaryMemory.create({
  title,
  content: entryText,
  createdBy: req.user._id
});

    res.status(201).json({ success: true, data: diary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create diary', error });
  }
};

// Get all diary memories created by the user
const getMyDiaryMemories = async (req, res) => {
  try {
    const diaries = await DiaryMemory.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: diaries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch diaries', error });
  }
};

// Get diary entries shared with user
const getSharedDiaryMemories = async (req, res) => {
  try {
    const sharedDiaries = await DiaryMemory.find({ sharedWith: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: sharedDiaries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch shared diaries', error });
  }
};

// Get a specific diary memory
const getDiaryMemoryById = async (req, res) => {
  try {
    const diary = await DiaryMemory.findById(req.params.memoryId);
    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });

    const isOwner = diary.createdBy.toString() === req.user._id.toString();
    const isShared = diary.sharedWith.includes(req.user._id);

    if (!isOwner && !isShared) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    res.json({ success: true, data: diary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch diary', error });
  }
};

// Update diary memory
const updateDiaryMemory = async (req, res) => {
  try {
    const { title, content } = req.body;
    const diary = await DiaryMemory.findById(req.params.memoryId);

    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });
    if (diary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this diary' });
    }

    if (title) diary.title = title;
    if (content) diary.content = content;

    await diary.save();
    res.json({ success: true, data: diary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update diary', error });
  }
};

// Delete diary
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

// Share diary with users
const shareDiaryWithUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const diary = await DiaryMemory.findById(req.params.memoryId);

    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });
    if (diary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to share this diary' });
    }

    userIds.forEach(id => {
      if (!diary.sharedWith.includes(id)) {
        diary.sharedWith.push(id);
      }
    });

    await diary.save();
    res.json({ success: true, data: diary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to share diary', error });
  }
};

module.exports = {  
    createDiaryMemory,
    getMyDiaryMemories,
    getSharedDiaryMemories,
    getDiaryMemoryById,
    updateDiaryMemory,
    deleteDiaryMemory,
    shareDiaryWithUsers
    };
