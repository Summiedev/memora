const mongoose = require('mongoose');

const PhotoAlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  photos: {
    type: [String],
    required: true
  },
//   capsule: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Capsule',
//     default: null
//   },
sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PhotoAlbum', PhotoAlbumSchema);
