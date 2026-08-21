const { z } = require('zod');
const User = require('../models/user.js');
const { UserDTO } = require('../utils/response');
const logger = require('../utils/logger');
const { userQuery } = require('../utils/schemas');

exports.getAllUsers = async (req, res) => {
  try {
    const { q, page, limit } = userQuery.parse(req.query);
    const skip = (page - 1) * limit;

    const query = q?.trim()
      ? {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { fullname: { $regex: q, $options: 'i' } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return res.status(200).json({ users: users.map(UserDTO), pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    logger.error(error, 'Error in getAllUsers');
    return res.status(500).json({ message: "Internal server error" });
  }
};
