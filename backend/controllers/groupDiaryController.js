const GroupDiary = require('../models/groupDiary.js');
const DiaryMemory = require('../models/diaryEntry.js');
const crypto = require('crypto');

// Create a group diary
const createGroupDiary = async (req, res) => {
  try {
    const { name, description, type, coverEmoji, memberIds } = req.body;
    const inviteCode = crypto.randomBytes(5).toString('hex').toUpperCase();

    const members = [req.user._id, ...(memberIds || [])];
    const admins  = [req.user._id];

    const group = await GroupDiary.create({
      name, description, type, coverEmoji: coverEmoji || '📖',
      createdBy: req.user._id,
      members, admins, inviteCode
    });

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create group diary', error });
  }
};

// Get all group diaries the user is part of
const getMyGroupDiaries = async (req, res) => {
  try {
    const groups = await GroupDiary.find({ members: req.user._id })
      .populate('members', 'fullname username')
      .populate('createdBy', 'fullname username')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch group diaries', error });
  }
};

// Get a single group diary and its entries
const getGroupDiaryById = async (req, res) => {
  try {
    const group = await GroupDiary.findById(req.params.groupId)
      .populate('members', 'fullname username avatar')
      .populate('createdBy', 'fullname username');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    const entries = await DiaryMemory.find({ groupId: req.params.groupId })
      .populate('createdBy', 'fullname username')
      .select('-pinHash')
      .sort({ createdAt: -1 });

    res.json({ success: true, group, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch group diary', error });
  }
};

// Join a group via invite code
const joinGroupViaCode = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const group = await GroupDiary.findOne({ inviteCode: inviteCode?.toUpperCase() });
    if (!group) return res.status(404).json({ success: false, message: 'Invalid invite code' });

    const alreadyMember = group.members.map(id => id.toString()).includes(req.user._id.toString());
    if (!alreadyMember) {
      group.members.push(req.user._id);
      await group.save();
    }

    res.json({ success: true, data: group, alreadyMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to join group diary', error });
  }
};

// Add entry to group diary
const addGroupEntry = async (req, res) => {
  try {
    const { title, entryText, emotionTag } = req.body;
    const group = await GroupDiary.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.map(id => id.toString()).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    const entry = await DiaryMemory.create({
      title,
      content: entryText || '',
      emotionTag: emotionTag || null,
      groupId: group._id,
      createdBy: req.user._id
    });

    await entry.populate('createdBy', 'fullname username');
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add group entry', error });
  }
};

module.exports = {
  createGroupDiary,
  getMyGroupDiaries,
  getGroupDiaryById,
  joinGroupViaCode,
  addGroupEntry
};
