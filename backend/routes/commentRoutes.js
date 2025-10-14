const express = require('express');
const router = express.Router();
const  authenticateToken  = require('../middleware/authMiddleware');
const commentCtrl = require('../controllers/commentController');


router.get('/test', (req, res) => {
  res.send('commentRoutes are working!');
});


// Comments endpoints:
router.get('/:capsuleId', authenticateToken, commentCtrl.getComments);
router.post('/:capsuleId', authenticateToken, commentCtrl.postComment);

module.exports = router;
