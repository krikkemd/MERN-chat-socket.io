const { ChatMessage } = require('../models/ChatMessageModel');
const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');

// TODO: SET USER DATA IN CREATE FROM REQ.USER

exports.getAllChatMessages = catchAsync(async (req, res, next) => {
  console.log('running getAllChatMessages');
  const chatMessages = await ChatMessage.find();

  return res.status(200).json({
    status: 'success',
    results: chatMessages.length,
    chatMessages,
  });
});

exports.getSingleChatMessage = catchAsync(async (req, res, next) => {
  console.log('running getSingleChatMessage');
  const chatMessageId = req.params.id;

  const chatMessage = await ChatMessage.findById({ _id: chatMessageId });

  if (!chatMessage) return next(new AppError('No document found with that ID', 404));

  return res.status(200).json({
    status: 'success',
    chatMessage,
  });
});

exports.createChatMessage = catchAsync(async (req, res, next) => {
  console.log('running createChatMessage');
  const newMessage = await ChatMessage.create({
    chatRoomId: req.body.chatRoomId,
    body: req.body.body,
    username: req.user.username,
    userId: req.user._id,
    // sender: req.body.sender,
    // type: req.body.type,
  });

  console.log('✅ chat message created');

  return res.status(201).json({
    status: 'success',
    chatMessage: newMessage,
  });
});

exports.deleteChatMessage = catchAsync(async (req, res, next) => {
  console.log('running deleteChatMessage');
  const chatMessageId = req.params.id;
  const chatMessage = await ChatMessage.findByIdAndDelete({ _id: chatMessageId });

  if (!chatMessage) return next(new AppError('No document found with that ID', 404));

  console.log('❌ chat message deleted');

  return res.status(204).json({ status: 'succces', data: null });
});
