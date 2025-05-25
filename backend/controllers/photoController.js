const photoAlbum = require('../models/photoAlbum');

 // For sharing validations if needed

// Create memory
const createMemory = async (req, res) => {
    try {
      console.log("Received body:", req.body); // 🕵️‍♂️ Check incoming data
      console.log("User:", req.user); // 🧑‍💻 Check if token worked
  
      const { title, description, photos } = req.body;
  
      if (!title || !photos || photos.length === 0) {
        return res.status(400).json({ success: false, message: "Title and photos are required" });
      }
  
      const memory = await photoAlbum.create({
        title,
        description,
        photos,
        createdBy: req.user._id,
      });
  
      res.status(201).json({ success: true, data: memory });
    } catch (error) {
      console.error("Memory creation error:", error); // Log the exact error
      res.status(500).json({ success: false, message: "Memory creation failed", error: error.message });
    }
  };
  
// Get own memories
const getMyMemories = async (req, res) => {
  try {
    const memories = await photoAlbum.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: memories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch memories', error });
  }
};

// Get memories shared with user
const getSharedWithMe = async (req, res) => {
  try {
    const memories = await photoAlbum.find({ sharedWith: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: memories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch shared memories', error });
  }
};

// Get single memory
const getMemoryById = async (req, res) => {
  try {
    const memory = await photoAlbum.findById(req.params.memoryId);

    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }

    const isOwner = memory.createdBy.toString() === req.user._id.toString();
    const isSharedWithUser = memory.sharedWith.includes(req.user._id);

    if (!isOwner && !isSharedWithUser) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    res.json({ success: true, data: memory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching memory', error });
  }
};

// Update memory
const updateMemory = async (req, res) => {
  try {
    const memory = await photoAlbum.findById(req.params.memoryId);
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });

    if (memory.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to update this memory' });
    }

    const { title, description } = req.body;
    if (title) memory.title = title;
    if (description) memory.description = description;

    await memory.save();
    res.json({ success: true, data: memory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error });
  }
};

// Add photos
const addPhotosToMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const { photos } = req.body; // Expect an array of URLs

    const memory = await photoAlbum.findById(memoryId);
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });

    if (memory.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to modify this memory' });
    }

    memory.photos.push(...photos);
    await memory.save();

    res.json({ success: true, data: memory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add photos', error });
  }
};

// Remove a photo
const removePhotoFromMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const { photoUrl } = req.body;

    const memory = await photoAlbum.findById(memoryId);
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });

    if (memory.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to remove from this memory' });
    }

    memory.photos = memory.photos.filter(url => url !== photoUrl);
    await memory.save();

    res.json({ success: true, data: memory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove photo', error });
  }
};

// Delete memory
const deleteMemory = async (req, res) => {
  try {
    const memory = await photoAlbum.findById(req.params.memoryId);
    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });

    if (memory.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this memory' });
    }

    await memory.deleteOne();
    res.json({ success: true, message: 'Memory deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete memory', error });
  }
};

// Share memory with users
const shareMemoryWithUsers = async (req, res) => {
  try {
    const { userIds } = req.body; // Array of user IDs to share with
    const memory = await photoAlbum.findById(req.params.memoryId);

    if (!memory) return res.status(404).json({ success: false, message: 'Memory not found' });

    if (memory.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to share this memory' });
    }

    userIds.forEach(id => {
      if (!memory.sharedWith.includes(id)) {
        memory.sharedWith.push(id);
      }
    });

    await memory.save();
    res.json({ success: true, data: memory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sharing failed', error });
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
