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
} = require('../controllers/ChatRoomController');

router.route('/').get(protectRoute, getAllChatRooms).post(protectRoute, createChatRoom);
router
  .route('/:id')
  .get(protectRoute, getSingleChatRoom)
  .patch(protectRoute, updateChatRoom)
  .delete(deleteChatRoom);
// .post(createChatMessage);
// router.route('/:id').get(getSingleChatMessage).delete(deleteChatMessage);

module.exports = router;
