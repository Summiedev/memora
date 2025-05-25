const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const capsuleController = require('../controllers/capsuleController'); // Using require for named imports

const router = express.Router();

// Or use diskStorage if you want to save files to disk

router.post('/create-capsule', authMiddleware, capsuleController.createCapsule);
router.get('/all-capsules', authMiddleware, capsuleController.getAllCapsules); // search, pagination, filter
router.get('/:id', authMiddleware, capsuleController.getCapsuleById);
router.patch('/:id', authMiddleware, capsuleController.updateCapsule);
router.delete('/delete-capsule/:id', authMiddleware, capsuleController.deleteCapsule);
router.post('/:id/share', authMiddleware, capsuleController.shareCapsule);
router.post('/send/:id', authMiddleware, capsuleController.sendCapsule); 



//router.post('/upload', authMiddleware, capsuleController.uploadFiles); // Upload files to S3



module.exports = router;