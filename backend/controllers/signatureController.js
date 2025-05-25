// controllers/cloudinary.controller.js
const cloudinary = require('cloudinary').v2;

const signatureSigned = (req, res) => {
  // Read folder from query, defaulting to "album_images"
  const folder = req.query.folder || 'album_images';
  const timestamp = Math.floor(Date.now() / 1000);

  // Sign both timestamp AND folder
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    apiKey:    process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    timestamp,
    signature,
    folder     // echo back the folder so the front end knows it
  });
};

module.exports = { signatureSigned };
