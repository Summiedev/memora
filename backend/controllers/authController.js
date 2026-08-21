const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.js');
const sendEmail = require('../utils/sendEmail.js');
const { UserDTO, FriendDTO } = require('../utils/response');
const { z } = require('zod');
const logger = require('../utils/logger');
const { registerBody, loginBody, forgotPasswordBody, requestPasswordResetBody, resetPasswordBody, updateProfileBody, updatePasswordBody } = require('../utils/schemas');

const generateAccessToken = (id, tokenVersion) => jwt.sign({ id, v: tokenVersion }, process.env.JWT_SECRET, { expiresIn: '15m' });
const generateRefreshToken = (id, tokenVersion) => jwt.sign({ id, v: tokenVersion }, process.env.JWT_SECRET, { expiresIn: '7d' });

const getCookieOptions = (maxAge) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge,
        path: '/'
    };
    if (isProduction) {
        options.domain = process.env.COOKIE_DOMAIN || undefined;
    }
    return options;
};

const register = async (req, res) => {
    try {
        const validated = registerBody.parse(req.body);
        const { fullname, username, email, password } = validated;

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            if (existing.email === email) return res.status(400).json({ error: 'Email already in use' });
            return res.status(400).json({ error: 'Username already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            username,
            isVerified: false,
            verificationToken
        });

        const accessToken = generateAccessToken(user._id, user.tokenVersion);
        const refreshToken = generateRefreshToken(user._id, user.tokenVersion);

        res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
        res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        if (err.code === 11000) {
      if (err.keyPattern.username) {
        return res
          .status(400)
          .json({ field: "username", message: "Username already exists. Please choose another." });
      }
      if (err.keyPattern.email) {
        return res
          .status(400)
          .json({ field: "email", message: "Email already in use. Please log in or use another." });
      }
    }
        res.status(500).json({ error: 'Registration failed. Please try again' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = loginBody.parse(req.body);
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user._id, user.tokenVersion);
        const refreshToken = generateRefreshToken(user._id, user.tokenVersion);

        res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
        res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

        res.json({ message: 'Login successful' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        res.status(500).json({ error: 'Login failed.' });
    }
};

const logout = async (req, res) => {
    try {
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
        }
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ error: 'Refresh token not provided' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ error: 'Invalid refresh token' });

        if (decoded.v !== user.tokenVersion) {
            return res.status(401).json({ error: 'Token has been revoked' });
        }

        const newAccessToken = generateAccessToken(user._id, user.tokenVersion);
        const newRefreshToken = generateRefreshToken(user._id, user.tokenVersion);

        res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));
        res.cookie('refreshToken', newRefreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

        res.json({ message: 'Token refreshed' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Refresh token expired' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = forgotPasswordBody.parse(req.body);
        const user = await User.findOne({ email });

        if (user) {
            const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
            await sendEmail(email, 'Password Reset', `Reset here: ${resetURL}`);
        }

        res.status(200).json({ message: 'If an account exists with that email, a password reset link has been sent.' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        res.status(500).json({ error: 'Could not send reset email' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { newPassword } = updatePasswordBody.parse(req.body);

        const hashed = await bcrypt.hash(newPassword, 12);
        await User.findByIdAndUpdate(req.user._id, {
            password: hashed,
            tokenVersion: req.user.tokenVersion + 1
        });

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

const verifyEmail = async (req, res) => {
    try {
      const { token } = req.query;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { email } = decoded;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'User is already verified' });
      }

      user.isVerified = true;
      await user.save();

      res.status(200).json({ message: 'Email successfully verified' });
    } catch (err) {
      res.status(500).json({ error: 'Verification failed' });
    }
  };

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').lean();
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ user: UserDTO(user) });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };

const requestPasswordReset = async (req, res) => {
    const { email } = requestPasswordResetBody.parse(req.body);

    try {
      const user = await User.findOne({ email });
      if (user) {
        const secret = process.env.JWT_SECRET + user.password;
        const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });

        const resetURL = `${process.env.CLIENT_URL}/reset-password?id=${user._id}&token=${token}`;
        const subject = 'Password Reset Request';
        const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetURL}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`;

         await sendEmail(email, subject, text);
      }

      res.status(200).json({ message: 'If an account exists with that email, a password reset link has been sent.' });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong, please try again' });
    }
  };

const resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = resetPasswordBody.parse(req.body);

    try {
      const user = await User.findOne({ _id: id });
      if (!user) {
        return res.status(400).json({ message: "Invalid reset link" });
      }

      const secret = process.env.JWT_SECRET + user.password;
      jwt.verify(token, secret);
      const encryptedPassword = await bcrypt.hash(password, 12);
      await User.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            password: encryptedPassword,
          },
        }
      );

      res.status(200).json({ message: 'Password has been reset' });
    } catch (error) {
      res.status(500).json({ message: 'Invalid or expired reset link' });
    }
  };

const googleAuthSuccess = async (req, res) => {
    try {
      const profile = req.user;

      let user = await User.findOne({
        $or: [
          { googleId: profile.id },
          { email: profile.email }
        ]
      });

      if (user && !user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }

      if (!user) {
        const randomUsername = profile.fullname.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10000);
        user = await User.create({
          fullname: profile.fullname,
          email: profile.email,
          username: randomUsername,
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value,
          isVerified: true
        });
      }

      const accessToken = generateAccessToken(user._id, user.tokenVersion);
      const refreshToken = generateRefreshToken(user._id, user.tokenVersion);

      res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
      res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

      res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    } catch (err) {
      res.status(500).json({ error: 'Google login failed' });
    }
  };

const updateProfile = async (req, res) => {
  try {
    const validated = updateProfileBody.parse(req.body);
    const updates = {};

    if (validated.fullname) updates.fullname = validated.fullname;
    if (validated.username) updates.username = validated.username;
    if (validated.email) updates.email = validated.email;
    if (validated.bio !== undefined) updates.bio = validated.bio;

    if (validated.password) {
      updates.password = await bcrypt.hash(validated.password, 12);
    }

    if (validated.notifications !== undefined || validated.darkMode !== undefined) {
      updates.settings = {};
      if (validated.notifications !== undefined) updates.settings.notifications = validated.notifications;
      if (validated.darkMode !== undefined) updates.settings.darkMode = validated.darkMode;
    }

    if (validated.avatar && validated.avatar.startsWith('data:')) {
      const [meta, base64Data] = validated.avatar.split(',');
      const contentType = meta.match(/data:(.*);base64/)[1];
      updates.avatar = {
        data:        Buffer.from(base64Data, 'base64'),
        contentType
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user: UserDTO(user) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Could not update profile' });
  }
};

  const getUserDetails = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password').lean();
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({ user: UserDTO(user) });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };

const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).select('friends').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const friendIds = user.friends || [];
    const total = friendIds.length;
    const paginatedIds = friendIds.slice(skip, skip + limit);

    const friends = await User.find({ _id: { $in: paginatedIds } })
      .select('fullname username avatar bio')
      .lean();

    res.json({ success: true, friends: friends.map(FriendDTO), pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
    register,
    login,
    logout,
    refresh,
    forgotPassword,
    getUserProfile,
    googleAuthSuccess,
    updatePassword,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    getUserDetails,
    getFriends
};
