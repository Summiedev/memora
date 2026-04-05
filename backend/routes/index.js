const express = require('express');
const router = express.Router();

const authRoutes         = require('../routes/authRoutes');
const capsuleRoutes      = require('../routes/capsuleRoutes');
const photoAlbumRoutes   = require('./photoAlbumRoutes');
const diaryEntryRoutes   = require('./diaryEntryRoutes');
const signatureRoutes    = require('./signatureRoutes');
const userRoutes         = require('./userRoutes');
const commentRoutes      = require('./commentRoutes');
const friendRoutes       = require('./friendRoutes');
const messageRoutes      = require('./messageRoutes');
const moodRoutes         = require('./moodRoutes');

router.use('/auth',                 authRoutes);
router.use('/capsules',             capsuleRoutes);
router.use('/photo-memories',       photoAlbumRoutes);
router.use('/diary-entries',        diaryEntryRoutes);   // includes /groups/* sub-routes
router.use('/cloudinary-signature', signatureRoutes);
router.use('/users',                userRoutes);
router.use('/comments',             commentRoutes);
router.use('/friends',              friendRoutes);
router.use('/messages',             messageRoutes);
router.use('/history',              messageRoutes);
router.use('/mood',                 moodRoutes);

router.get('/', (req, res) => res.send('API is working!'));

module.exports = router;
