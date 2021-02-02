const express = require('express');

const router = express.Router();

// Chat Message Endpoint: /api/v1/chatMessages

// import CRUD actions / handlers
const {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
} = require('../controllers/chatMessageController');

router.route('/').get(getAllChatMessages).post(createChatMessage);
router.route('/:id').delete(deleteChatMessage);

module.exports = router;
