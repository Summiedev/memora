const router = require('express').Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
router.get('/',userController.getAllUsers);
router.get('/friends', authMiddleware, authController.getFriends);

module.exports = router;