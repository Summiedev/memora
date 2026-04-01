const express = require('express');
const router = express.Router();

 
const authRoutes         = require('../routes/authRoutes');
const capsuleRoutes      = require('../routes/capsuleRoutes');
const photoAlbumRoutes   = require('./photoAlbumRoutes');
const diaryEntryRoutes   = require('./diaryEntryRoutes');
const signatureRoutes    = require('./signatureRoutes');
const userRoutes         = require('./userRoutes');
const commentRoutes      = require('./commentRoutes');
const friendRoutes       = require('./friendRoutes');       // ← new unified friends routes
const messageRoutes      = require('./messageRoutes');
const moodRoutes         = require('./moodRoutes');
 
router.use('/auth',                authRoutes);
router.use('/capsules',            capsuleRoutes);
router.use('/photo-memories',      photoAlbumRoutes);
router.use('/diary-entries',       diaryEntryRoutes);
router.use('/cloudinary-signature',signatureRoutes);
router.use('/users',               userRoutes);
router.use('/comments',            commentRoutes);
router.use('/friends',             friendRoutes);          // ← /api/friends & /api/friends/pending
router.use('/messages',            messageRoutes);         // ← /api/messages/:chatId  (frontend calls this)
router.use('/history',             messageRoutes);         // ← keep old /api/history/* working too
router.use('/mood',                moodRoutes);

 
router.get('/', (req, res) => res.send('API is working!'));
 
module.exports = router;
 