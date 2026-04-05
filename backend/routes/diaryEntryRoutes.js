const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const diaryController = require('../controllers/diaryController');
const groupDiaryController = require('../controllers/groupDiaryController');
const router = express.Router();

// Personal diary entries
router.post('/create-diary',      authMiddleware, diaryController.createDiaryMemory);
router.get('/all-diary',          authMiddleware, diaryController.getMyDiaryMemories);
router.get('/shared',             authMiddleware, diaryController.getSharedDiaryMemories);
router.get('/on-this-day',        authMiddleware, diaryController.getOnThisDay);
router.get('/streak',             authMiddleware, diaryController.getStreak);

router.get('/:memoryId',          authMiddleware, diaryController.getDiaryMemoryById);
router.post('/:memoryId/unlock',  authMiddleware, diaryController.unlockSecretDiary);
router.patch('/:memoryId',        authMiddleware, diaryController.updateDiaryMemory);
router.delete('/:memoryId',       authMiddleware, diaryController.deleteDiaryMemory);
router.post('/:memoryId/share',   authMiddleware, diaryController.shareDiaryWithUsers);

// Group diaries
router.post('/groups/create',           authMiddleware, groupDiaryController.createGroupDiary);
router.get('/groups/mine',              authMiddleware, groupDiaryController.getMyGroupDiaries);
router.post('/groups/join',             authMiddleware, groupDiaryController.joinGroupViaCode);
router.get('/groups/:groupId',          authMiddleware, groupDiaryController.getGroupDiaryById);
router.post('/groups/:groupId/entries', authMiddleware, groupDiaryController.addGroupEntry);

module.exports = router;
