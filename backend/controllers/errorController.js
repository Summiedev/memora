// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // your Mongoose user model

// GET all users (optional: implement search query with ?q=)
router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.q;
    let users;

    if (searchQuery) {
      // Case-insensitive partial match for username or name
      users = await User.find({
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { name: { $regex: searchQuery, $options: 'i' } },
        ],
      }).select('-password'); // exclude password field
    } else {
      users = await User.find().select('-password');
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
