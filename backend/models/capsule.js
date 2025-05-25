const mongoose = require('mongoose');

const CapsuleSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  message:          { type: String },
  category:         { type: String, enum: ['Personal','Work','Memories','Milestones','Other'], default: 'Personal' },
  coverImage:       { type: String },
  sendToOthers:     { type: Boolean, default: false },
  recipientName:    { type: String },
  recipientEmail:   { type: String },
  recipientPhone:   { type: String },
  permissionLevel:  { type: String, enum: ['viewer','collaborator'], default: 'viewer' },
  messageForRecipient: { type: String },
  sendDate:         { type: Date, required: true },
  reminder:         { type: Boolean, default: false },
  lockUntilSend:    { type: Boolean, default: false },
  sendMethod:       { type: String, enum: ['email','sms'], default: 'email' },
  tags:             [{ type: String }],
  media:            [{ type: String, required: true }],
  sharedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:           { type: String, enum: ['Unlocked','Locked','Pending','Sent'], default: 'Unlocked' },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memories: [{
    memoryType: { type: String, required: true, enum: ['Diary','PhotoAlbum'] },
    memory:     { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'memories.memoryType' }
  }]
}, { timestamps: true });

const Capsule = mongoose.model('Capsule', CapsuleSchema);
module.exports = Capsule;
