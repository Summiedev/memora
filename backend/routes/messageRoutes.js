const express = require('express');
const MessageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/message",authMiddleware, MessageController.sendMessage);
router.get("/:userId/:friendId", authMiddleware,MessageController.getChatHistory);
router.get("/:chatId", authMiddleware, MessageController.readHistory);


module.exports = router;