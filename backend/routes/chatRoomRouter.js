const express = require('express');

const router = express.Router();
const { protectRoute, restrictTo } = require('../controllers/authController');

// Chat Message Endpoint: /api/v1/chatMessages

// import CRUD actions / handlers
const {
  getAllChatRooms,
  getSingleChatRoom,
  createChatRoom,
  updateChatRoom,
  deleteChatRoom,
  leaveChatRoom,
  getAllUnreadMessages,
  joinChatRoom,
} = require('../controllers/chatRoomController');

router.route('/').get(protectRoute, getAllChatRooms).post(protectRoute, createChatRoom);
router.route('/getAllUnreadMessages').get(protectRoute, getAllUnreadMessages);
router
  .route('/:id')
  .get(protectRoute, getSingleChatRoom)
  .patch(protectRoute, updateChatRoom)
  .delete(protectRoute, deleteChatRoom);

router.route('/:id/leaveChatRoom').patch(protectRoute, leaveChatRoom);
router.route('/:id/joinChatRoom').patch(protectRoute, joinChatRoom);
// .post(createChatMessage);
// router.route('/:id').get(getSingleChatMessage).delete(deleteChatMessage);

module.exports = router;
