const { ChatMessage } = require('../models/ChatMessageModel');
const { ChatRoom } = require('../models/ChatRoomModel');
const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');

exports.getAllChatMessages = catchAsync(async (req, res, next) => {
  console.log('running getAllChatMessages❌ INCLUDING SKIP OF 10 ');
  console.log(req.query);
  console.log(req.user._id);

  const skip = req.query.skip && /^\d+$/.test(req.query.skip) ? Number(req.query.skip) : 0;

  console.log(skip);

  // req.user._id zodat alleen logged in user messages te zien krijgt, miss req.user._id sturen vanaf frontend en hier pakken in req.query.userId
  const chatMessages = await ChatMessage.find({ chatRoomId: req.query.chatRoomId }, undefined, {
    skip,
    limit: 10,
  }).sort({
    createdAt: 'desc',
  });

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

  // Only allow to get single message if you are the author
  if (req.user._id.toString() !== chatMessage.userId.toString())
    return next(new AppError('No document or no permission', 403));

  return res.status(200).json({
    status: 'success',
    chatMessage,
  });
});

exports.createChatMessage = catchAsync(async (req, res, next) => {
  console.log('running createChatMessage');

  //////////////////// CHECK IF USER IS INSIDE CHATROOM ////////////////////////

  // get the chatroom the message is send into
  const chatRoom = await ChatRoom.findById({ _id: req.body.chatRoomId });

  let membersArray = [];

  // push the user id's of the chatroom members inside membersArray
  chatRoom.members.map(member => membersArray.push(member._id.toString()));

  // Check if the message sender is a member inside the chatroom
  reqUserIsMember = membersArray.includes(req.user._id.toString());

  console.log('User is a member of the chatroom?:');
  console.log(reqUserIsMember);

  // return error if the user is not inside the chatroom
  if (reqUserIsMember === false)
    return next(new AppError('You are not allowed to perform that action', 403));

  //////////////////// CHECK IF USER IS INSIDE CHATROOM ////////////////////////

  const newMessage = await ChatMessage.create({
    chatRoomId: req.body.chatRoomId,
    body: req.body.body,
    username: req.user.username,
    read: req.user._id,
    userId: req.user._id,
    systemMessage: req.body.systemMessage,
  });

  console.log('✅ chat message created');

  return res.status(201).json({
    status: 'success',
    chatMessage: newMessage,
  });
});

exports.createSystemMessage = catchAsync(async (req, res, next) => {
  console.log('running CreateSystemMessage');
  const newMessage = await ChatMessage.create({
    chatRoomId: req.body.chatRoomId,
    body: req.body.body,
    username: 'system',
    userId: '6085719e7c9abb247891cde9',
    systemMessage: true,
  });

  console.log('✅ system message created');

  return res.status(201).json({
    status: 'success',
    systemMessage: newMessage,
  });
});

exports.markMessagesRead = catchAsync(async (req, res, next) => {
  console.log('running markMessagesRead');

  //////////////////// CHECK IF USER IS INSIDE CHATROOM ////////////////////////
  // get the chatroom the message is send into
  const chatRoom = await ChatRoom.findById({ _id: req.body.chatRoomId });

  let membersArray = [];

  // push the user id's of the chatroom members inside membersArray
  chatRoom.members.map(member => membersArray.push(member._id.toString()));

  // Check if the message sender is a member inside the chatroom
  reqUserIsMember = membersArray.includes(req.user._id.toString());

  console.log('User is a member of the chatroom?:');
  console.log(reqUserIsMember);

  // return error if the user is not inside the chatroom
  if (reqUserIsMember === false)
    return next(new AppError('You are not allowed to perform that action', 403));

  //////////////////// CHECK IF USER IS INSIDE CHATROOM ////////////////////////

  // The message sender is automatically included in the read array, so you've always read your own messages
  // Find all the messages in the chatroom where the req.user._id is not present.
  let unreadMessages = await ChatMessage.find({
    read: { $ne: req.user._id },
    chatRoomId: req.body.chatRoomId,
  });

  // Push the req.user._id to the read array, and await saving the message
  unreadMessages.map(async message => {
    message.read.push(req.user._id);
    await message.save();
  });

  // return an empty array if all the messages are read (markedAsRead)
  return res.status(200).json({
    status: 'success',
    results: unreadMessages.length,
    data: unreadMessages,
    chatRoomId: req.body.chatRoomId,
  });
});

exports.deleteChatMessage = catchAsync(async (req, res, next) => {
  console.log('running deleteChatMessage');
  const chatMessageId = req.params.id;
  const chatMessage = await ChatMessage.findById({ _id: chatMessageId });

  if (!chatMessage) return next(new AppError('No document found with that ID', 404));

  if (req.user._id.toString() !== chatMessage.userId.toString())
    return next(new AppError('Unauthorized, cannot delete message', 403));

  await chatMessage.deleteOne();

  console.log('❌ chat message deleted');

  return res.status(204).json({ status: 'succces', data: null });
});

// helper function to clean the req.body so user can only change values that are allowed.
// const cleanReqBody = (reqBody, ...allowedValuesToChangeOnDoc) => {
//   let cleanedReqBody = {};
//   console.log('filtering req.body');
//   console.log(reqBody);
//   Object.keys(reqBody).forEach(el => {
//     if (allowedValuesToChangeOnDoc.includes(el)) {
//       cleanedReqBody[el] = reqBody[el];
//     }
//   });
//   return cleanedReqBody;
// };
