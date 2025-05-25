const Capsule = require('../models/capsule.js');

const createCapsule = async (req, res) => {
  try {
    const {
      title,
      message,
      category,
      sendToOthers,
      recipientName,
      recipientEmail,
      recipientPhone,
      permissionLevel,
      messageForRecipient,
      sendDate,
      reminder,
      lockUntilSend,
      sendMethod,
      tags,
      media,        // URLs from Cloudinary
      coverImage    // Selected cover image URL
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
      sendToOthers,
      recipientName,
      recipientEmail,
      recipientPhone,
      permissionLevel: permissionLevel || 'viewer',
      messageForRecipient,
      sendDate: new Date(sendDate),
      reminder: !!reminder,
      lockUntilSend: !!lockUntilSend,
      sendMethod,
      tags: tagArray,
      media,
      status,
      createdBy: req.user._id
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
const getCapsuleById = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found' });
    res.json({ success: true, data: capsule });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve capsule' });
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
const shareCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found' });

    res.json({ success: true, message: `Capsule "${capsule.title}" shared.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to share capsule' });
  }
};

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
    // uploadFiles, // Uncomment if you implement file upload functionality
};
