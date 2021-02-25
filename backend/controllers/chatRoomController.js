const factoryController = require('./factoryController');
const { ChatRoom } = require('../models/ChatRoomModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

// exports.getAllChatRooms = factoryController.getAllDocuments(ChatRoom);

exports.getAllChatRooms = catchAsync(async (req, res, next) => {
  console.log('running getAllChatRooms');
  const chatRooms = await ChatRoom.find({ members: req.user._id }).populate('chatMessages'); // returns rooms where the currentUser is a member
  res.status(200).json({ status: 'success', results: chatRooms.length, chatRooms });
});

exports.getSingleChatRoom = factoryController.getSingleDoc(ChatRoom, 'chatMessages'); // Populate chatMessages in the room
exports.createChatRoom = factoryController.createOne(ChatRoom);
exports.updateChatRoom = factoryController.updateOne(ChatRoom);
exports.deleteChatRoom = factoryController.deleteOne(ChatRoom);
