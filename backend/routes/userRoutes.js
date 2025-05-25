const router = require('express').Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
router.get('/',userController.getAllUsers);

module.exports = router;