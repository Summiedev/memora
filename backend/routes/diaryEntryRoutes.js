const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const diaryController = require('../controllers/diaryController'); // Using require for named imports
const router = express.Router();

router.post('/create-diary', authMiddleware, diaryController.createDiaryMemory);


router.get('/all-diary', authMiddleware, diaryController.getMyDiaryMemories);

router.get('/shared', authMiddleware, diaryController.getSharedDiaryMemories);


router.get('/:memoryId', authMiddleware, diaryController.getDiaryMemoryById);


router.patch('/:memoryId', authMiddleware, diaryController.updateDiaryMemory);

router.delete('/:memoryId', authMiddleware, diaryController.deleteDiaryMemory);

router.post('/:memoryId/share', authMiddleware, diaryController.shareDiaryWithUsers);

module.exports = router;