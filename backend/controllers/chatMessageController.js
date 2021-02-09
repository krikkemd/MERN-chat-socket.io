const { ChatMessage } = require('../models/ChatMessageModel');
const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');

exports.getAllChatMessages = catchAsync(async (req, res, next) => {
  console.log('running getAllChatMessages');
  const chatMessages = await ChatMessage.find();
  // return res.json(chatMessages);
  return res.status(200).json({
    status: 'success',
    results: chatMessages.length,
    chatMessages,
    // JSEND
    // data: {
    //   chatMessages,
    // },
  });
});

exports.createChatMessage = catchAsync(async (req, res, next) => {
  console.log('running createChatMessage');
  const newMessage = await ChatMessage.create({
    body: req.body.body,
    username: req.body.username,
    userId: req.body.userId,
    sender: req.body.sender,
    type: req.body.type,
  });

  console.log('✅ chat message created');

  // return newMessage;
  return res.status(201).json({
    status: 'success',
    chatMessage: newMessage,
  });
});

exports.deleteChatMessage = catchAsync(async (req, res, next) => {
  console.log('running deleteChatMessage');
  const chatMessageId = req.params.id;

  // Check if the document exists in the db collection
  await ChatMessage.exists({ _id: chatMessageId }, async (err, result) => {
    if (err) {
      // console.log(err);
      return next(new AppError('Error deleting message', 500));
    } else {
      // if doc doesnt exist
      if (!result) {
        console.log(`❌ document exists: ${result}`);
        return next(new AppError('chat message not found.', 404));

        // if doc exists
      } else if (result) {
        console.log(`✅ document exists: ${result}`);

        // try to delete the document
        await ChatMessage.deleteOne({ _id: chatMessageId }, err => {
          if (err) return next(new AppError('Error! Could not delete the chat message.', 500));

          console.log('❌ chat message deleted');

          return res.status(204).json({
            status: 'success',
          });
        });
      }
    }
  });
});
