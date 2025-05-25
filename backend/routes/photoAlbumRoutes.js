const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const photoController = require('../controllers/photoController'); // Using require for named imports
const router = express.Router();

router.post('/create-photo-album', authMiddleware, photoController.createMemory);
router.get('/get-all-photo', authMiddleware, photoController.getMyMemories);
router.get('/shared', authMiddleware, photoController.getSharedWithMe);
router.get('/:memoryId', authMiddleware, photoController.getMemoryById);
router.patch('/:memoryId', authMiddleware, photoController.updateMemory);
router.post('/:memoryId/add-photo', authMiddleware, photoController.addPhotosToMemory);
router.delete('/:memoryId/remove-photo', authMiddleware, photoController.removePhotoFromMemory);
router.delete('/:memoryId', authMiddleware, photoController.deleteMemory);

// sharing
router.post('/:memoryId/share', authMiddleware, photoController.shareMemoryWithUsers);




module.exports = router;