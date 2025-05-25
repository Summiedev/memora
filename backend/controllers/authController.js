const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.js');
const sendEmail = require('../utils/sendEmail.js');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

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

        // ✅ Auto-generate token after signup
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // ✅ Respond with token
        res.status(201).json({ token });

    } catch (err) {
        console.error("❌ Registration error:", err);
        res.status(500).json({ error: 'Registration failed.' });
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

        const token = generateToken(user._id);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Login failed.' });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header

        if (!token) {
            return res.status(400).json({ error: 'Token is required for logout' });
        }



        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
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
  
      const resetURL = `${process.env.CLIENT_URL}/reset-zpassword?id=${user._id}&token=${token}`;
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
  
      const token = generateToken(user._id);
      res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
    } catch (err) {
      console.error('Google login failed:', err);
      res.status(500).json({ error: 'Google login failed' });
    }
  };

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    getUserProfile,
    googleAuthSuccess,
    updatePassword,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
};
