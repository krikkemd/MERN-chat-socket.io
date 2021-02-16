const express = require('express');

const router = express.Router();
const { protectRoute, restrictTo } = require('../controllers/authController');

// Chat Message Endpoint: /api/v1/chatMessages

// import CRUD actions / handlers
const {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
  getSingleChatMessage,
} = require('../controllers/chatMessageController');

router.route('/').get(protectRoute, getAllChatMessages).post(createChatMessage);
router
  .route('/:id')
  .get(protectRoute, getSingleChatMessage)
  .delete(protectRoute, deleteChatMessage);

module.exports = router;
