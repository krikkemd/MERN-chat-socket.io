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

// Mark message as read
// exports.updateChatMessage = catchAsync(async (req, res, next) => {
//   const cleanedReqBody = cleanReqBody(req.body, 'read');

//   console.log('running updateChatMessage');
//   const chatMessageId = req.params.id;
//   const chatMessage = await ChatMessage.findByIdAndUpdate({ _id: chatMessageId }, cleanedReqBody, {
//     new: true,
//     runValidators: true,
//   });

//   if (!chatMessage) return next(new AppError('No document found with that ID', 404));

//   console.log('✅ chat message updated');

//   return res.status(202).json({ status: 'succces', data: chatMessage });
// });

exports.markMessagesRead = catchAsync(async (req, res, next) => {
  const messages = await ChatMessage.updateMany(
    { read: false, chatRoomId: req.body.chatRoomId, userId: req.body.memberId },
    { read: true },
    (err, res) => {
      if (err) return next(new AppError('updateMany went wrong', 500));

      console.log(req.body.chatRoomId);

      console.log('✅ chat messages marked as read');
    },
  );
  return res.status(200).json({ status: 'success', data: messages });
});

exports.deleteChatMessage = catchAsync(async (req, res, next) => {
  console.log('running deleteChatMessage');
  const chatMessageId = req.params.id;
  const chatMessage = await ChatMessage.findByIdAndDelete({ _id: chatMessageId });

  if (!chatMessage) return next(new AppError('No document found with that ID', 404));

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
