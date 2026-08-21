const { z } = require('zod');
const cloudinary = require('cloudinary').v2;
const { signatureQuery } = require('../utils/schemas');
const logger = require('../utils/logger');

const signatureSigned = (req, res) => {
  try {
    const { folder } = signatureQuery.parse(req.query);
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
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
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    logger.error(error, 'Cloudinary signature error');
    res.status(500).json({ message: 'Failed to generate signature' });
  }
};

const voiceSignature = (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { folder: 'voice_notes', timestamp },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp,
      signature,
      folder: 'voice_notes'
    });
  } catch (error) {
    logger.error(error, 'Cloudinary voice signature error');
    res.status(500).json({ message: 'Failed to generate signature' });
  }
};

module.exports = { signatureSigned, voiceSignature };
