const cloudinary = require('cloudinary').v2;

const signatureSigned = (req, res) => {
  const folder = req.query.folder || 'album_images';
  

  const timestamp = Math.floor(Date.now() / 1000);

  // Sign timestamp, folder, and resource_type
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    timestamp,
    signature,
    folder     // echo back the folder so the front end knows it
  });
};




const voiceSignature = (req, res) => {
  try {
    const folder = 'voice_notes';
    const timestamp = Math.floor(Date.now() / 1000);

  
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp,
      signature,
      folder
    });
  } catch (error) {
    console.error('Cloudinary voice signature error:', error);
    res.status(500).json({ message: 'Failed to generate signature' });
  }
};

module.exports = { signatureSigned,voiceSignature };