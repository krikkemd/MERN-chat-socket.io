const express = require('express');

const router = express.Router();
const { protectRoute, restrictTo, isLoggedIn } = require('../controllers/authController');

// Chat Message Endpoint: /api/v1/chatMessages

// import CRUD actions / handlers
const {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
  getSingleChatMessage,
} = require('../controllers/chatMessageController');

// res.locals.user
// router.use(isLoggedIn);

router.route('/').get(protectRoute, getAllChatMessages).post(protectRoute, createChatMessage);
router
  .route('/:id')
  .get(protectRoute, getSingleChatMessage)
  .delete(protectRoute, deleteChatMessage);

module.exports = router;
