const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const moodController = require('../controllers/moodController'); // Using require for named imports

const router = express.Router();



router.post('/', authMiddleware, moodController.postMood);
router.get('/today', authMiddleware, moodController.getToodayMood); 
router.get('/week', authMiddleware, moodController.getWeeklyMood);







module.exports = router;