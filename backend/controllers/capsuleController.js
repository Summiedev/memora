const Capsule = require('../models/capsule.js');
const User = require('../models/user.js');

const createCapsule = async (req, res) => {
  try {
    const {
      title,
      message,
      category,
      //sendToOthers,
      //recipientName,
      //recipientEmail,
      //recipientPhone,
      permissionLevel,
      messageForRecipient,
      sendDate,
      reminder,
      lockUntilSend,
      sendMethod,
      tags,
      media,        // URLs from Cloudinary
      coverImage,    // Selected cover image URL
        capsuleType,    // "private" or "shared"
      sharedWith,     // [ array of friend IDs ]
      //emotionTags     // [ array of strings ]
    } = req.body;

    // Determine initial status
    let status = 'Unlocked';
    if (lockUntilSend) {
      status = 'Locked';
    } else if (new Date(sendDate) > new Date()) {
      status = 'Pending';
    } else {
      status = 'Sent';
    }

    // Normalize tags array
    let tagArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagArray = tags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(tags)) {
        tagArray = tags;
      }
    }

    // Build capsule document
    const capsuleData = {
      title,
      message,
      category: category || 'Personal',
      coverImage: coverImage || null,
     // sendToOthers,
      //recipientName,
      //recipientEmail,
      //recipientPhone,
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
    //  emotionTags: Array.isArray(emotionTags) ? emotionTags : []
    };

    const newCapsule = await Capsule.create(capsuleData);

    res.status(201).json({
      success: true,
      message: 'Capsule created successfully!',
      data: newCapsule
    });
  } catch (error) {
    console.error("Submission error URL:", error.response?.config?.url);
  console.error("Full error:", error.response || error.message);
  alert('Failed to submit. Please try again.');
    console.error('Error creating capsule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create capsule.',
      error: error.message
    });
  }
};
// // Create capsule (unchanged)
// const createCapsule = async (req, res) => {
//   try {
//     const {
//       title,
//       message,
//       sendToOthers,
//       recipientName,
//       recipientEmail,
//       recipientPhone,
//       messageForRecipient,
//       sendDate,
//       lockUntilSend,
//       sendMethod,
//       tags,
//       media, // This will now contain URLs of the uploaded photos from Cloudinary
//     } = req.body;

//     let status = 'Unlocked'; // Default status
//     if (lockUntilSend === 'true') {
//       status = 'Locked'; // Set to Locked if lockUntilSend is true
//     } else if (new Date(sendDate) > new Date()) {
//       status = 'Pending'; // If the sendDate is in the future, set as Pending
//     } else {
//       status = 'Sent'; // If sendDate has passed, set to Sent
//     }
//     let tagArray = [];
//     if (tags) {
//       if (typeof tags === 'string') {
//         tagArray = tags.split(',').map(tag => tag.trim());
//       } else if (Array.isArray(tags)) {
//         tagArray = tags; // If it's already an array, just use it
//       }
//     }

//     const capsuleData = {
//       title,
//       message,
//       sendToOthers: sendToOthers === 'true', // Ensure this is treated as a boolean
//       recipientName,
//       recipientEmail,
//       recipientPhone,
//       messageForRecipient,
//       sendDate: new Date(sendDate), // Ensure it's in date format
//       lockUntilSend: lockUntilSend === 'true', // Ensure it's treated as a boolean
//       sendMethod,
//       tags: tagArray, // Split and trim tags
//      media, // Photos now contains URLs from Cloudinary
//       status, // Add status to the capsule data
//       createdBy: req.user._id, // Assuming you have user info in req.user
//     };

//     // Logic to save the capsule data (database code)
//     // This could involve saving to a MongoDB collection or whatever DB you're using
//     const newCapsule = await Capsule.create(capsuleData);

//     res.status(201).json({
//       success: true,
//       message: 'Capsule created successfully!',
//       data: newCapsule,
//     });
//   } catch (error) {
//     console.error('Error creating capsule:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create capsule. Please try again.',
//       error: error.message,
//     });
//   }
// };

// ✅ Get all capsules with search, filter & pagination
const getAllCapsules = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sendMethod, sendToOthers } = req.query;
    
        const query = {
          createdBy: req.user.id // 🔒 This line filters to only the logged-in user
        };
        
        if (search) {
          query.title = { $regex: search, $options: 'i' };
        }
        
        if (sendMethod) {
          query.sendMethod = sendMethod;
        }
        
        if (sendToOthers !== undefined) {
          query.sendToOthers = sendToOthers === 'true';
        }
        
        const capsules = await Capsule.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit));
    
        const total = await Capsule.countDocuments(query);
    
        res.status(200).json({
          success: true,
          capsules,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        });
      } catch (err) {
        console.error("Get All Capsules Error:", err);
        res.status(500).json({ success: false, message: 'Failed to get capsules' });
      }
};

// Get single capsule
// const getCapsuleById = async (req, res) => {
//   try {
//     const capsule = await Capsule.findById(req.params.id);
//     if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found' });
//     res.json({ success: true, data: capsule });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Failed to retrieve capsule' });
//   }
// };
// In controllers/capsuleController.js
const shareCapsule = async (req, res) => {
  try {
    const capsuleId = req.params.id;
    const userId    = req.user._id;    // assuming auth middleware sets req.user
    const capsule   = await Capsule.findById(capsuleId);
    if (!capsule) 
      return res.status(404).json({ success: false, message: 'Capsule not found' });

    // Only owner can “share” this capsule
    if (capsule.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator may share' });
    }

    // Capsule must have type “shared”
    if (capsule.capsuleType !== 'shared') {
      return res.status(400).json({ success: false, message: 'Only shared‐type capsules can be shared' });
    }

    // Get array of friend IDs from the capsule’s own sharedWith[]
    const friendsToShareWith = capsule.sharedWith.map(x => x.toString());
    if (!friendsToShareWith.length) {
      return res.status(400).json({
        success: false,
        message: 'No friends specified in capsule.sharedWith'
      });
    }

    // For each friendId, add this capsule to their User.sharedCapsules
    await Promise.all(
      friendsToShareWith.map(async friendId => {
        await User.findByIdAndUpdate(
          friendId,
          { $addToSet: { sharedCapsules: capsule._id } }
        );
      })
    );

    return res.json({ success: true, message: 'Capsule shared with friends' });
  } catch (err) {
    console.error('shareCapsule error:', err);
    return res.status(500).json({ success: false, message: 'Failed to share capsule' });
  }
};


// ─── DELETE /api/capsules/:id/share ────────────────────────────────────────
// A shared friend “unshares” it from their own view:
//   • Remove capsuleId from their own User.sharedCapsules
//   • Also remove them from Capsule.sharedWith if you want
const unshareCapsule = async (req, res) => {
  try {
    const capsuleId = req.params.id;
    const userId    = req.user._id;    // currently logged‐in friend

    const capsule = await Capsule.findById(capsuleId);
    if (!capsule)
      return res.status(404).json({ success: false, message: 'Capsule not found' });

    // Only remove if this capsule is actually shared with them
    const isSharedWithMe = capsule.sharedWith
      .map(x => x.toString())
      .includes(userId.toString());
    if (!isSharedWithMe) {
      return res.status(403).json({ success: false, message: 'Not shared with you' });
    }

    // 1) Remove this capsule from the user’s sharedCapsules array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { sharedCapsules: capsule._id } }
    );

    // 2) Optionally remove the userId from the capsule.sharedWith list
    await Capsule.findByIdAndUpdate(
      capsuleId,
      { $pull: { sharedWith: userId } }
    );

    return res.json({ success: true, message: 'Removed capsule from your shared list' });
  } catch (err) {
    console.error('unshareCapsule error:', err);
    return res.status(500).json({ success: false, message: 'Failed to unshare capsule' });
  }
};

const getCapsuleById = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id)
      .populate('sharedWith', 'username')   // If you want to show who it’s shared with
      .populate('createdBy', 'username');

    if (!capsule) 
      return res.status(404).json({ success: false, message: 'Capsule not found' });

    const userId = req.user._id.toString();
    const isCreator = capsule.createdBy._id.toString() === userId;
    const isSharedRecipient = capsule.sharedWith
      .map(obj => obj._id.toString())
      .includes(userId);

    // 1) Private capsule: only creator can view
    if (capsule.capsuleType === 'private' && !isCreator) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // 2) Shared capsule: if user isn’t in sharedWith and not creator → forbidden
    if (capsule.capsuleType === 'shared' && !isCreator && !isSharedRecipient) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // 3) Locked / Pending logic
    const now = new Date();
    const willUnlockAt = new Date(capsule.sendDate);
    if (capsule.lockUntilSend && now < willUnlockAt) {
      // Still locked
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

    // 4) If we fall through here, it is unlocked/past sendDate → reveal all:
    return res.json({ success: true, data: capsule });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to retrieve capsule' });
  }
};

// controllers/capsuleController.js
const getTimeline = async (req, res) => {
  try {
    const userId = req.user._id;
    // Return _all_ capsules created by this user, sorted by sendDate
    const timeline = await Capsule.find({ createdBy: userId })
      .sort({ sendDate: 1 })
      .select('title sendDate status capsuleType'); 
    return res.json({ success: true, timeline });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Timeline fetch failed' });
  }
};


// Update
const updateCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found' });
    res.json({ success: true, data: capsule });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Delete
const deleteCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findByIdAndDelete(req.params.id);
    if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found' });
    res.json({ success: true, message: 'Capsule deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete capsule' });
  }
};

// Share


// ✅ Send via Email or SMS
const sendCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found' });

    // Dummy simulation
    if (capsule.sendMethod === 'email') {
      console.log(`Sending email to ${capsule.recipientEmail} with message: ${capsule.messageForRecipient}`);
    } else if (capsule.sendMethod === 'sms') {
      console.log(`Sending SMS to ${capsule.recipientPhone} with message: ${capsule.messageForRecipient}`);
    }

    res.json({ success: true, message: `Capsule sent via ${capsule.sendMethod}` });
  } catch (err) {
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
    unshareCapsule, // Added unshareCapsule function
    // uploadFiles, // Uncomment if you implement file upload functionality
};
