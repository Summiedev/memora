const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.js');
const sendEmail = require('../utils/sendEmail.js');

const generateAccessToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            username,
            isVerified: false,
            verificationToken
        });

        // ✅ Auto-generate tokens after signup
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // ✅ Set HTTP-only cookies
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Strict',  // Allow cross-domain in production
            maxAge: 15 * 60 * 1000 // 15 minutes
        };
        if (isProduction) {
            // Set domain for production if needed
            cookieOptions.domain = process.env.COOKIE_DOMAIN || undefined;
        }
        res.cookie('accessToken', accessToken, cookieOptions);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // ✅ Respond with success
        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        console.error("❌ Registration error:", err);
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
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

       // // if (!user.isVerified) return res.status(403).json({ error: 'Please verify your email before logging in' });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Set HTTP-only cookies
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        };
        if (isProduction) {
            cookieOptions.domain = process.env.COOKIE_DOMAIN || undefined;
        }
        res.cookie('accessToken', accessToken, cookieOptions);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ error: 'Login failed.' });
    }
};

const logout = async (req, res) => {
    try {
        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

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

        const newAccessToken = generateAccessToken(user._id);

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Strict',
            maxAge: 15 * 60 * 1000
        };
        if (isProduction) {
            cookieOptions.domain = process.env.COOKIE_DOMAIN || undefined;
        }
        res.cookie('accessToken', newAccessToken, cookieOptions);

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
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        await sendEmail(email, 'Password Reset', `Reset here: ${resetURL}`);

        res.json({ message: 'Password reset link sent to email' });
    } catch (err) {
        res.status(500).json({ error: 'Could not send reset email' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(decoded.id, { password: hashed });

        res.json({ message: 'Password updated' });
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

const verifyEmail = async (req, res) => {
    try {
      const { token } = req.query;
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { email } = decoded;
  
      // Find the user with the provided email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Update the user's verification status
      if (user.isVerified) {
        return res.status(400).json({ message: 'User is already verified' });
      }
  
      user.isVerified = true;
      await user.save();
  
      // Return a success response
      res.status(200).json({ message: 'Email successfully verified' });
    } catch (err) {
      console.error("❌ Email verification error:", err);
      res.status(500).json({ error: 'Verification failed' });
    }
  };
  const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); // exclude password
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ user });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
 
  const requestPasswordReset = async (req, res, next) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
    
      if (!user) return res.status(404).json({ message: "User doesn't exist" });
  
      const secret = process.env.JWT_SECRET + user.password;
      const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });
  
      const resetURL = `${process.env.CLIENT_URL}/reset-password?id=${user._id}&token=${token}`;
      const subject= 'Password Reset Request';
      const text= `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${resetURL}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`;

  
       await sendEmail(email, subject, text);
  
      res.status(200).json({ message: 'Password reset link sent' });
    } catch (error) {
      console.error('Error doing so:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }; 

  const resetPassword = async (req, res, next) => {
    const { id, token } = req.params;
    const { password } = req.body;
  
    try {
      const user = await User.findOne({ _id: id });
      if (!user) {
        return res.status(400).json({ message: "User not exists!" });
      }
  
      const secret = process.env.JWT_SECRET + user.password; 
  
  
  
      const verify = jwt.verify(token, secret);
      const encryptedPassword = await bcrypt.hash(password, 10);
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
  
  
      await user.save();
  
      res.status(200).json({ message: 'Password has been reset' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong, please try again' });
    }
  };

  const googleAuthSuccess = async (req, res) => {
    try {
      const profile = req.user;
  
      // Try to find by googleId OR email
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.googleId },
          { email: profile.email }
        ]
      });
  
      // If user exists but doesn't have googleId set yet, update it
      if (user && !user.googleId) {
        user.googleId = profile.googleId;
        await user.save();
      }
  
      // If user doesn't exist, create one
      if (!user) {
        const randomUsername = profile.fullname.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10000);
        user = await User.create({
          fullname: profile.fullname,
          email: profile.email,
          username: randomUsername,
          googleId: profile.googleId,
          avatar: profile.avatar,
        });
      }
  
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'None' : 'Strict',
          maxAge: 15 * 60 * 1000
      };
      if (isProduction) {
          cookieOptions.domain = process.env.COOKIE_DOMAIN || undefined;
      }
      res.cookie('accessToken', accessToken, cookieOptions);
      res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'None' : 'Strict',
          maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    } catch (err) {
      console.error('Google login failed:', err);
      res.status(500).json({ error: 'Google login failed' });
    }
  };
// controllers/auth.js

const updateProfile = async (req, res) => {
  try {
    const updates = {};
    ['fullname','username','email','bio'].forEach(f => {
      if (req.body[f] != null) updates[f] = req.body[f];
    });

    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.body.notifications != null || req.body.darkMode != null) {
      updates.settings = {};
      if (req.body.notifications != null) updates.settings.notifications = req.body.notifications;
      if (req.body.darkMode      != null) updates.settings.darkMode      = req.body.darkMode;
    }

    // Handle avatar as Base64 data URL
    if (req.body.avatar && req.body.avatar.startsWith('data:')) {
      // e.g. "data:image/jpeg;base64,/9j/4AAQ..."
      const [meta, base64Data] = req.body.avatar.split(',');
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
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Convert avatar buffer back to data URL for the response
    let avatarDataUrl = null;
    if (user.avatar?.data) {
      const b64 = user.avatar.data.toString('base64');
      avatarDataUrl = `data:${user.avatar.contentType};base64,${b64}`;
    }

    res.json({
      user: {
        id:        user._id,
        fullname:  user.fullname,
        username:  user.username,
        email:     user.email,
        bio:       user.bio,
        avatar:    avatarDataUrl,
        settings:  user.settings
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Could not update profile' });
  }
};

// controllers/auth.js

const getUserDetails= async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // convert avatar buffer → data URL
    let avatarDataUrl = null;
    if (user.avatar?.data) {
      const b64 = user.avatar.data.toString('base64');
      avatarDataUrl = `data:${user.avatar.contentType};base64,${b64}`;
    }

    res.json({
      user: {
        id:        user._id,
        fullname:  user.fullname,
        username:  user.username,
        email:     user.email,
        bio:       user.bio,
        avatar:    avatarDataUrl,
        settings:  user.settings
      }
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
const getFriends = async (req, res) => {
  try {
    // req.user is assumed to be populated by your auth middleware
    const userId = req.user._id;

    // Populate friends array (you can choose which fields to select)
    const user = await User.findById(userId)
      .populate('friends', 'fullname username avatar') // bring in basic friend info
      .select('friends');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, friends: user.friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
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
