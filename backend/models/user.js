const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String },
  friends:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified:        { type: Boolean, default: false },
  verificationToken: { type: String },
  googleId:          { type: String, unique: true, sparse: true },
  bio:               { type: String, default: '' },
  tokenVersion:      { type: Number, default: 0 },
  settings: {
    notifications: { type: Boolean, default: true },
    darkMode:      { type: Boolean, default: false }
  },
  avatar: {
    data: Buffer,
    contentType: String
  }
}, { timestamps: true });

userSchema.index({ pendingFriendRequests: 1 });
userSchema.index({ username: 'text', fullname: 'text' });

const User = mongoose.model('User', userSchema);
module.exports = User;
