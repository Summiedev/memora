const { z } = require('zod');
const Comment = require('../models/comment');
const Capsule = require('../models/capsule');
const { CommentDTO } = require('../utils/response');
const logger = require('../utils/logger');
const { postCommentBody, commentParams } = require('../utils/schemas');

const checkCapsulePermission = async (capsuleId, userId) => {
  const capsule = await Capsule.findById(capsuleId).lean();
  if (!capsule) return { error: 'Capsule not found', status: 404 };

  const isCreator = capsule.createdBy.toString() === userId;
  const isSharedRecipient = capsule.sharedWith.map(x => x.toString()).includes(userId);

  if (capsule.capsuleType === 'private' && !isCreator) {
    return { error: 'Forbidden', status: 403 };
  }
  if (capsule.capsuleType === 'shared' && !isCreator && !isSharedRecipient) {
    return { error: 'Forbidden', status: 403 };
  }
  if (capsule.lockUntilSend && new Date() < new Date(capsule.sendDate)) {
    return { error: 'Capsule still locked', status: 403 };
  }

  return { capsule };
};

const getComments = async (req, res) => {
  try {
    const { capsuleId } = commentParams.parse(req.params);

    const permission = await checkCapsulePermission(capsuleId, req.user._id.toString());
    if (permission.error) {
      return res.status(permission.status).json({ success: false, message: permission.error });
    }

    const comments = await Comment.find({ capsuleId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: 1 })
      .lean();

    return res.json({ success: true, comments: comments.map(CommentDTO) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    logger.error(err, 'Failed to fetch comments');
    return res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
};

const postComment = async (req, res) => {
  try {
    const { capsuleId } = commentParams.parse(req.params);
    const { content } = postCommentBody.parse(req.body);

    const permission = await checkCapsulePermission(capsuleId, req.user._id.toString());
    if (permission.error) {
      return res.status(permission.status).json({ success: false, message: permission.error });
    }

    const newComment = await Comment.create({
      capsuleId,
      userId: req.user._id,
      content: content.trim()
    });

    await newComment.populate('userId', 'username avatar');

    return res.status(201).json({ success: true, comment: CommentDTO(newComment.toObject()) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    logger.error(err, 'Failed to post comment');
    return res.status(500).json({ success: false, message: 'Failed to post comment' });
  }
};

module.exports = { getComments, postComment };
