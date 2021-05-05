const express = require('express');

const router = express.Router();
const { protectRoute, restrictTo, isLoggedIn } = require('../controllers/authController');

// Chat Message Endpoint: /api/v1/chatMessages

// import CRUD actions / handlers
const {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
  // updateChatMessage,
  // markMessagesRead,
  getSingleChatMessage,
  createSystemMessage,
} = require('../controllers/chatMessageController');

// res.locals.user
// router.use(isLoggedIn);

router.route('/').get(protectRoute, getAllChatMessages).post(protectRoute, createChatMessage);
// .patch(protectRoute, markMessagesRead);
router
  .route('/:id')
  .get(protectRoute, getSingleChatMessage)
  // .patch(protectRoute, updateChatMessage)
  .delete(protectRoute, deleteChatMessage);

router.route('/createSystemMessage').post(protectRoute, createSystemMessage);

module.exports = router;
