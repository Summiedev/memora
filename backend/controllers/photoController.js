const { z } = require('zod');
const photoAlbum = require('../models/photoAlbum');
const { PhotoDTO } = require('../utils/response');
const logger = require('../utils/logger');
const { createPhotoBody, updatePhotoBody, addPhotosBody, removePhotoBody, sharePhotoBody, photoParams, pagination } = require('../utils/schemas');

// Create memory
const createMemory = async (req, res) => {
    try {
      const parsed = createPhotoBody.parse(req.body);
      const { title, description, photos } = parsed;
   
      const memory = await photoAlbum.create({
        title,
        description,
        photos,
        createdBy: req.user._id,
      });
  
      res.status(201).json({ success: true, data: PhotoDTO(memory.toObject()) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0].message });
      }
      logger.error(error, 'Memory creation failed');
      res.status(500).json({ success: false, message: "Memory creation failed" });
    }
  };
   
// Get own memories
const getMyMemories = async (req, res) => {
  try {
    const { page, limit } = pagination.parse(req.query);
    const skip = (page - 1) * limit;

    const [memories, total] = await Promise.all([
      photoAlbum.find({ createdBy: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      photoAlbum.countDocuments({ createdBy: req.user._id })
    ]);

    res.json({ success: true, data: memories, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error(error, 'Failed to fetch memories');
    res.status(500).json({ success: false, message: 'Failed to fetch memories' });
  }
};

// Get memories shared with user
const getSharedWithMe = async (req, res) => {
  try {
    const { page, limit } = pagination.parse(req.query);
    const skip = (page - 1) * limit;

    const [memories, total] = await Promise.all([
      photoAlbum.find({ sharedWith: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      photoAlbum.countDocuments({ sharedWith: req.user._id })
    ]);

    res.json({ success: true, data: memories, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error(error, 'Failed to fetch shared memories');
    res.status(500).json({ success: false, message: 'Failed to fetch shared memories' });
  }
};

// Get single memory
const getMemoryById = async (req, res) => {
  try {
    const { memoryId } = photoParams.parse(req.params);
    const memory = await photoAlbum.findById(memoryId).lean();
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }

    const isOwner = memory.createdBy.toString() === req.user._id.toString();
    const isSharedWithUser = memory.sharedWith.includes(req.user._id);

    if (!isOwner && !isSharedWithUser) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    res.json({ success: true, data: PhotoDTO(memory) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    logger.error(error, 'Error fetching memory');
    res.status(500).json({ success: false, message: 'Error fetching memory' });
  }
};

// Update memory
const updateMemory = async (req, res) => {
  try {
    const { memoryId } = photoParams.parse(req.params);
    const parsed = updatePhotoBody.parse(req.body);
    const memory = await photoAlbum.findById(memoryId).lean();
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });

    if (memory.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to update this memory' });
    }

    const updates = {};
    if (parsed.title) updates.title = parsed.title;
    if (parsed.description !== undefined) updates.description = parsed.description;

    const updated = await photoAlbum.findByIdAndUpdate(memoryId, { $set: updates }, { new: true }).lean();
    res.json({ success: true, data: PhotoDTO(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    logger.error(error, 'Update failed');
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Add photos
const addPhotosToMemory = async (req, res) => {
  try {
    const { memoryId } = photoParams.parse(req.params);
    const { photos } = addPhotosBody.parse(req.body);

    const memory = await photoAlbum.findById(memoryId).lean();
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });

    if (memory.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to modify this memory' });
    }

    const updated = await photoAlbum.findByIdAndUpdate(memoryId, { $push: { photos: { $each: photos } } }, { new: true }).lean();
    res.json({ success: true, data: PhotoDTO(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    logger.error(error, 'Failed to add photos');
    res.status(500).json({ success: false, message: 'Failed to add photos' });
  }
};

// Remove a photo
const removePhotoFromMemory = async (req, res) => {
  try {
    const { memoryId } = photoParams.parse(req.params);
    const { photoUrl } = removePhotoBody.parse(req.body);

    const memory = await photoAlbum.findById(memoryId).lean();
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });

    if (memory.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to remove from this memory' });
    }

    const updated = await photoAlbum.findByIdAndUpdate(memoryId, { $pull: { photos: photoUrl } }, { new: true }).lean();
    res.json({ success: true, data: PhotoDTO(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    logger.error(error, 'Failed to remove photo');
    res.status(500).json({ success: false, message: 'Failed to remove photo' });
  }
};

// Delete memory
const deleteMemory = async (req, res) => {
  try {
    const { memoryId } = photoParams.parse(req.params);
    const memory = await photoAlbum.findById(memoryId).lean();
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });

    if (memory.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this memory' });
    }

    await photoAlbum.findByIdAndDelete(memoryId);
    res.json({ success: true, message: 'Memory deleted' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    logger.error(error, 'Failed to delete memory');
    res.status(500).json({ success: false, message: 'Failed to delete memory' });
  }
};

// Share memory with users
const shareMemoryWithUsers = async (req, res) => {
  try {
    const { memoryId } = photoParams.parse(req.params);
    const { userIds } = sharePhotoBody.parse(req.body);
    const memory = await photoAlbum.findById(memoryId).lean();

    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });

    if (memory.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to share this memory' });
    }

    const uniqueIds = [...new Set([...memory.sharedWith.map(id => id.toString()), ...userIds.map(id => id.toString())])];
    const updated = await photoAlbum.findByIdAndUpdate(memoryId, { $set: { sharedWith: uniqueIds } }, { new: true }).lean();
    res.json({ success: true, data: PhotoDTO(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    logger.error(error, 'Sharing failed');
    res.status(500).json({ success: false, message: 'Sharing failed' });
  }
};

module.exports = { 
    createMemory,
    getMyMemories,
    getSharedWithMe,
    getMemoryById,
    updateMemory,
    addPhotosToMemory,
    removePhotoFromMemory,
    deleteMemory,
    shareMemoryWithUsers
    };
