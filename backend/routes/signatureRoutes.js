// routes/signatureRoute.js
const express = require('express');
const cloudinary = require('cloudinary').v2;

const router = express.Router();
const signature = require('../controllers/signatureController'); // Assuming you have a signatureController file

router.get('/signature',signature.signatureSigned );
router.get('/signature/voice', signature.voiceSignature);

module.exports = router;
