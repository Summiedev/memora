const bcrypt = require('bcryptjs');
const User = require('../models/user.js');

exports.getAllUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (searchQuery && typeof searchQuery !== "string") {
      return res.status(400).json({ message: "Invalid search query." });
    }

    let users;
    if (searchQuery?.trim()) {
      users = await User.find({
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { fullname: { $regex: searchQuery, $options: 'i' } }
        ]
      }).select('-password');
    } else {
      users = await User.find().select('-password');
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
