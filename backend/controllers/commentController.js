const Comment = require('../models/comment');
const Capsule = require('../models/capsule');   // your capsule model
const User = require('../models/user');

// exports.getComments = async (req, res, next) => {
//   try {
//     const { capsuleId } = req.params;
//     // optionally verify capsule exists
//     const comments = await Comment.find({ capsuleId })
//       .sort('createdAt')
//       .populate('userId', 'fullname username avatar');

//     res.json({ success: true, data: comments });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.postComment = async (req, res, next) => {
//   try {
//     const { capsuleId } = req.params;
//     const { content } = req.body;
//     const userId = req.user.id;

//     // (Optionally verify capsule exists and is unlocked)
//     const capsule = await Capsule.findById(capsuleId);
//     if (!capsule) return res.status(404).json({ success: false, error: 'Capsule not found' });

//     const comment = await Comment.create({ capsuleId, userId, content });
//     await comment.populate('userId', 'fullname username avatar').execPopulate();

//     res.status(201).json({ success: true, data: comment });
//   } catch (err) {
//     next(err);
//   }
// };
// // ==========================
// // controllers/commentController.js
// // ==========================
// const Capsule = require('../models/capsule');


const getComments = async (req, res) => {
  try {
    const { capsuleId } = req.params;                    // ← match the route param

    // 1. Fetch the capsule
    const capsule = await Capsule.findById(capsuleId);
    if (!capsule) {
      return res.status(404).json({ success: false, message: 'Capsule not found' });
    }

    // 2. Permission checks
    const userId = req.user._id.toString();
    const isCreator = capsule.createdBy.toString() === userId;
    const isSharedRecipient = capsule.sharedWith.map(x => x.toString()).includes(userId);
    const now = new Date();

    if (capsule.capsuleType === 'private' && !isCreator) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (capsule.capsuleType === 'shared' && !isCreator && !isSharedRecipient) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (capsule.lockUntilSend && now < new Date(capsule.sendDate)) {
      return res.status(403).json({ success: false, message: 'Capsule still locked' });
    }

    // 3. Fetch comments, populating `userId` (not `author`)
    const comments = await Comment.find({ capsuleId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: 1 });

    return res.json({ success: true, comments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
};

const postComment = async (req, res) => {
  try {
    const { capsuleId } = req.params;                    // ← match the route param
    const { content } = req.body;

    // 1. Fetch the capsule
    const capsule = await Capsule.findById(capsuleId);
    if (!capsule) {
      return res.status(404).json({ success: false, message: 'Capsule not found' });
    }

    // 2. Permission checks (same as getComments)
    const userId = req.user._id.toString();
    const isCreator = capsule.createdBy.toString() === userId;
    const isSharedRecipient = capsule.sharedWith.map(x => x.toString()).includes(userId);
    const now = new Date();

    if (capsule.capsuleType === 'private' && !isCreator) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (capsule.capsuleType === 'shared' && !isCreator && !isSharedRecipient) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (capsule.lockUntilSend && now < new Date(capsule.sendDate)) {
      return res.status(403).json({ success: false, message: 'Capsule still locked' });
    }

    // 3. Create the new comment, using `userId` (required by your schema)
    const newComment = await Comment.create({
      capsuleId,
      userId: req.user._id,                              // ← must match schema’s required field
      content: content.trim()
    });

    // 4. Populate the `userId` field so you can return username/avatar
    await newComment.populate('userId', 'username avatar');

    return res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to post comment' });
  }
};

module.exports = { getComments, postComment };
