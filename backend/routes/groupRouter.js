const express = require('express');

const router = express.Router();
const { protectRoute, restrictTo } = require('../controllers/authController');

// Chat Message Endpoint: /api/v1/chatMessages

// import CRUD actions / handlers
const {
  getAllGroups,
  getSingleGroup,
  createGroup,
  updateGroup,
  deleteGroup,
} = require('../controllers/groupController');

router.route('/').get(protectRoute, getAllGroups).post(protectRoute, createGroup);
router
  .route('/:id')
  .get(protectRoute, getSingleGroup)
  .patch(protectRoute, updateGroup)
  .delete(deleteGroup);
// .post(createChatMessage);
// router.route('/:id').get(getSingleChatMessage).delete(deleteChatMessage);

module.exports = router;
