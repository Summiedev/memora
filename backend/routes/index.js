const express = require('express');
const router = express.Router();

const authRoutes = require('../routes/authRoutes');
const capsuleRoutes = require('../routes/capsuleRoutes');   
const photoAlbumRoutes = require("./photoAlbumRoutes");
const diaryEntryRoutes = require("./diaryEntryRoutes");
const signatureRoutes = require('./signatureRoutes'); 
const userRoutes = require('./userRoutes'); // Assuming you have a userRoutes file
// Assuming you have a signatureRoute file 
// const memoryRoutes = require('../routes/memoryRoutes'); // Assuming you have a memoryRoutes file
// const photoAlbumRoutes = require('../routes/photoAlbumRoutes'); // Assuming you have a photoAlbumRoutes file     
// const diaryEntryRoutes = require('../routes/diaryEntryRoutes'); // Assuming you have a diaryEntryRoutes file

router.use('/auth', authRoutes);
router.use('/capsules', capsuleRoutes);
router.use('/photo-memories', photoAlbumRoutes);
router.use('/diary-entries', diaryEntryRoutes); 
router.use('/cloudinary-signature', signatureRoutes); // Assuming you have a signatureRoute file
router.use('/users', userRoutes); // Assuming you have a userRoutes file
router.use('/friend-requests', require('./friendRequestRoutes')); 
router.use('/history', require('./messageRoutes')); // Assuming you have a messageRoutes file
router.use('/mood', require('./moodRoutes')); // Assuming you have a moodRoutes file
// Assuming you have a friendRequestRoutes file
router.get('/', (req, res) => {
    res.send('API is working!');
});

module.exports = router;