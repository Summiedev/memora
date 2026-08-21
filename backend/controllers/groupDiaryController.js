const { z } = require('zod');
const GroupDiary = require('../models/groupDiary.js');
const DiaryMemory = require('../models/diaryEntry.js');
const crypto = require('crypto');
const { GroupDTO, DiaryDTO } = require('../utils/response');
const logger = require('../utils/logger');
const { createGroupBody, joinGroupBody, addGroupEntryBody, groupParams, pagination } = require('../utils/schemas');

// Create a group diary
const createGroupDiary = async (req, res) => {
  try {
    const parsed = createGroupBody.parse(req.body);
    const { name, description, type, coverEmoji, memberIds } = parsed;
    const inviteCode = crypto.randomBytes(5).toString('hex').toUpperCase();

    const members = [req.user._id, ...(memberIds || [])];
    const admins  = [req.user._id];

    const group = await GroupDiary.create({
      name, description, type, coverEmoji: coverEmoji || '📖',
      createdBy: req.user._id,
      members, admins, inviteCode
    });

    res.status(201).json({ success: true, data: GroupDTO(group.toObject()) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    logger.error(error, 'Failed to create group diary');
    res.status(500).json({ success: false, message: 'Failed to create group diary' });
  }
};

// Get all group diaries the user is part of
const getMyGroupDiaries = async (req, res) => {
  try {
    const { page, limit } = pagination.parse(req.query);
    const skip = (page - 1) * limit;

    const [groups, total] = await Promise.all([
      GroupDiary.find({ members: req.user._id })
        .populate('members', 'fullname username')
        .populate('createdBy', 'fullname username')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GroupDiary.countDocuments({ members: req.user._id })
    ]);

    res.json({ success: true, data: groups.map(GroupDTO), pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error(error, 'Failed to fetch group diaries');
    res.status(500).json({ success: false, message: 'Failed to fetch group diaries' });
  }
};

// Get a single group diary and its entries
const getGroupDiaryById = async (req, res) => {
  try {
    const { groupId } = groupParams.parse(req.params);
    const { page, limit } = pagination.parse(req.query);
    const skip = (page - 1) * limit;

    const group = await GroupDiary.findById(groupId)
      .populate('members', 'fullname username avatar')
      .populate('createdBy', 'fullname username');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    const [entries, total] = await Promise.all([
      DiaryMemory.find({ groupId })
        .populate('createdBy', 'fullname username')
        .select('-pinHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DiaryMemory.countDocuments({ groupId })
    ]);

    res.json({ success: true, group: GroupDTO(group.toObject()), entries: entries.map(DiaryDTO), pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    logger.error(error, 'Failed to fetch group diary');
    res.status(500).json({ success: false, message: 'Failed to fetch group diary' });
  }
};

// Join a group via invite code
const joinGroupViaCode = async (req, res) => {
  try {
    const { inviteCode } = joinGroupBody.parse(req.body);
    const group = await GroupDiary.findOne({ inviteCode: inviteCode.toUpperCase() }).lean();
    if (!group) return res.status(404).json({ success: false, message: 'Invalid invite code' });

    const alreadyMember = group.members.map(id => id.toString()).includes(req.user._id.toString());
    if (!alreadyMember) {
      await GroupDiary.findByIdAndUpdate(group._id, { $addToSet: { members: req.user._id } });
    }

    const updated = await GroupDiary.findById(group._id).lean();
    res.json({ success: true, data: GroupDTO(updated), alreadyMember });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    logger.error(error, 'Failed to join group diary');
    res.status(500).json({ success: false, message: 'Failed to join group diary' });
  }
};

// Add entry to group diary
const addGroupEntry = async (req, res) => {
  try {
    const { groupId } = groupParams.parse(req.params);
    const { title, entryText, emotionTag } = addGroupEntryBody.parse(req.body);
    const group = await GroupDiary.findById(groupId).lean();
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

    const populated = await entry.populate('createdBy', 'fullname username').execPopulate();
    res.status(201).json({ success: true, data: DiaryDTO(populated.toObject()) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    logger.error(error, 'Failed to add group entry');
    res.status(500).json({ success: false, message: 'Failed to add group entry' });
  }
};

module.exports = {
  createGroupDiary,
  getMyGroupDiaries,
  getGroupDiaryById,
  joinGroupViaCode,
  addGroupEntry
};
