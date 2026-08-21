const { z } = require('zod');
const Capsule = require('../models/capsule.js');
const User = require('../models/user.js');
const { CapsuleDTO } = require('../utils/response');
const logger = require('../utils/logger');
const { createCapsuleBody, updateCapsuleBody, capsuleQuery, capsuleParams } = require('../utils/schemas');

const createCapsule = async (req, res) => {
  try {
    const parsed = createCapsuleBody.parse(req.body);
    const {
      title,
      message,
      category,
      permissionLevel,
      messageForRecipient,
      sendDate,
      reminder,
      lockUntilSend,
      sendMethod,
      tags,
      media,
      coverImage,
      capsuleType,
      sharedWith,
    } = parsed;

    let status = 'Unlocked';
    if (lockUntilSend) {
      status = 'Locked';
    } else if (new Date(sendDate) > new Date()) {
      status = 'Pending';
    } else {
      status = 'Sent';
    }

    let tagArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagArray = tags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(tags)) {
        tagArray = tags;
      }
    }

    const capsuleData = {
      title,
      message,
      category: category || 'Personal',
      coverImage: coverImage || null,
      permissionLevel: permissionLevel || 'viewer',
      messageForRecipient,
      sendDate: new Date(sendDate),
      reminder: !!reminder,
      lockUntilSend: !!lockUntilSend,
      sendMethod,
      tags: tagArray,
      media,
      status,
      createdBy: req.user._id,
      capsuleType: capsuleType || 'private',
      sharedWith: Array.isArray(sharedWith) ? sharedWith : [],
    };

    const newCapsule = await Capsule.create(capsuleData);

res.status(201).json({
       success: true,
       message: 'Capsule created successfully!',
       data: CapsuleDTO(newCapsule)
     });
   } catch (error) {
     if (error instanceof z.ZodError) {
       return res.status(400).json({ success: false, message: error.errors[0].message });
     }
     res.status(500).json({
       success: false,
       message: 'Failed to create capsule.'
     });
   }
 };

const getAllCapsules = async (req, res) => {
  try {
    const parsed = capsuleQuery.parse(req.query);
    const pageNum = Math.max(1, parsed.page);
    const limitNum = Math.min(50, parsed.limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { createdBy: req.user._id };

    if (parsed.search) {
      query.title = { $regex: parsed.search, $options: 'i' };
    }
    if (parsed.sendMethod) {
      query.sendMethod = parsed.sendMethod;
    }
    if (parsed.sendToOthers !== undefined) {
      query.sendToOthers = parsed.sendToOthers === 'true';
    }

    const [capsules, total] = await Promise.all([
      Capsule.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Capsule.countDocuments(query)
    ]);

res.status(200).json({
       success: true,
       capsules: capsules.map(CapsuleDTO),
       pagination: {
         total,
         page: pageNum,
         pages: Math.ceil(total / limitNum)
       }
     });
   } catch (err) {
     if (err instanceof z.ZodError) {
       return res.status(400).json({ success: false, message: err.errors[0].message });
     }
     res.status(500).json({ success: false, message: 'Failed to get capsules' });
   }
 };

const getCapsuleById = async (req, res) => {
  try {
    const parsed = capsuleParams.parse(req.params);
    const capsule = await Capsule.findById(parsed.id)
      .populate('sharedWith', 'username')
      .populate('createdBy', 'username');

    if (!capsule)
      return res.status(404).json({ success: false, message: 'Capsule not found' });

    const userId = req.user._id.toString();
    const isCreator = capsule.createdBy._id.toString() === userId;
    const isSharedRecipient = capsule.sharedWith
      .map(obj => obj._id.toString())
      .includes(userId);

    if (capsule.capsuleType === 'private' && !isCreator) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (capsule.capsuleType === 'shared' && !isCreator && !isSharedRecipient) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const now = new Date();
    const willUnlockAt = new Date(capsule.sendDate);
    if (capsule.lockUntilSend && now < willUnlockAt) {
      return res.json({
        success: true,
        data: {
          _id: capsule._id,
          title: capsule.title,
          status: 'Locked',
          unlockDate: capsule.sendDate,
          sharedWith: capsule.capsuleType === 'shared' ? capsule.sharedWith : [],
          capsuleType: capsule.capsuleType,
        }
      });
    }

res.json({ success: true, data: CapsuleDTO(capsule.toObject()) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to retrieve capsule' });
  }
 };

const shareCapsule = async (req, res) => {
  try {
    const parsed = capsuleParams.parse(req.params);
    const capsuleId = parsed.id;
    const userId = req.user._id;
    const capsule = await Capsule.findById(capsuleId).lean();
    if (!capsule)
      return res.status(404).json({ success: false, message: 'Capsule not found' });

    if (capsule.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator may share' });
    }

    if (capsule.capsuleType !== 'shared') {
      return res.status(400).json({ success: false, message: 'Only shared-type capsules can be shared' });
    }

    const friendsToShareWith = capsule.sharedWith.map(x => x.toString());
    if (!friendsToShareWith.length) {
      return res.status(400).json({
        success: false,
        message: 'No friends specified in capsule.sharedWith'
      });
    }

    await User.updateMany(
      { _id: { $in: friendsToShareWith } },
      { $addToSet: { sharedCapsules: capsule._id } }
    );

return res.json({ success: true, message: 'Capsule shared with friends' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to share capsule' });
  }
 };

const unshareCapsule = async (req, res) => {
  try {
    const parsed = capsuleParams.parse(req.params);
    const capsuleId = parsed.id;
    const userId = req.user._id;

    const capsule = await Capsule.findById(capsuleId).lean();
    if (!capsule)
      return res.status(404).json({ success: false, message: 'Capsule not found' });

    const isSharedWithMe = capsule.sharedWith
      .map(x => x.toString())
      .includes(userId.toString());
    if (!isSharedWithMe) {
      return res.status(403).json({ success: false, message: 'Not shared with you' });
    }

    await User.findByIdAndUpdate(
      userId,
      { $pull: { sharedCapsules: capsule._id } }
    );

    await Capsule.findByIdAndUpdate(
      capsuleId,
      { $pull: { sharedWith: userId } }
    );

return res.json({ success: true, message: 'Removed capsule from your shared list' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to unshare capsule' });
  }
 };

const getTimeline = async (req, res) => {
  try {
    const parsed = capsuleQuery.parse(req.query);
    const page = Math.max(1, parsed.page);
    const limit = Math.min(50, parsed.limit);
    const skip = (page - 1) * limit;

    const [timeline, total] = await Promise.all([
      Capsule.find({ createdBy: req.user._id })
        .sort({ sendDate: 1 })
        .select('title sendDate status capsuleType')
        .skip(skip)
        .limit(limit)
        .lean(),
      Capsule.countDocuments({ createdBy: req.user._id })
    ]);

    return res.json({ success: true, timeline: timeline.map(CapsuleDTO), pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    return res.status(500).json({ success: false, message: 'Timeline fetch failed' });
  }
 };

const updateCapsule = async (req, res) => {
  try {
    const parsed = capsuleParams.parse(req.params);
    const parsedBody = updateCapsuleBody.parse(req.body);
    const allowed = ['title','message','category','coverImage','sendToOthers','recipientName','recipientEmail','recipientPhone','permissionLevel','messageForRecipient','sendDate','reminder','lockUntilSend','sendMethod','tags','media','capsuleType','sharedWith','emotionTags','contributors','memories'];
    const updates = {};
    for (const key of allowed) {
      if (parsedBody[key] !== undefined) updates[key] = parsedBody[key];
    }

    const existing = await Capsule.findById(parsed.id).select('createdBy').lean();
    if (!existing) return res.status(404).json({ success: false, message: 'Capsule not found' });
    if (existing.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this capsule' });
    }

    const capsule = await Capsule.findByIdAndUpdate(parsed.id, { $set: updates }, { new: true }).lean();
    res.json({ success: true, data: CapsuleDTO(capsule) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Update failed' });
  }
 };

const deleteCapsule = async (req, res) => {
  try {
    const parsed = capsuleParams.parse(req.params);
    const capsule = await Capsule.findById(parsed.id).select('createdBy').lean();
    if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found' });
    if (capsule.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this capsule' });
    }

    await Capsule.findByIdAndDelete(parsed.id);
    res.json({ success: true, message: 'Capsule deleted successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to delete capsule' });
  }
 };

const sendCapsule = async (req, res) => {
  try {
    const parsed = capsuleParams.parse(req.params);
    const capsule = await Capsule.findById(parsed.id);
    if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found' });

    res.json({ success: true, message: `Capsule sent via ${capsule.sendMethod}` });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to send capsule' });
  }
 };

module.exports = {
    createCapsule,
    getAllCapsules,
    getCapsuleById,
    updateCapsule,
    deleteCapsule,
    shareCapsule,
    sendCapsule,
    getTimeline,
    unshareCapsule,
};
