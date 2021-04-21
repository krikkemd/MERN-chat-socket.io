const factoryController = require('./factoryController');
const { ChatRoom } = require('../models/ChatRoomModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

// exports.getAllChatRooms = factoryController.getAllDocuments(ChatRoom);

// exports.getAllChatRooms = catchAsync(async (req, res, next) => {
//   console.log('running getAllChatRooms');

//   console.log('queryString:');
//   console.log(req.query);

//   const chatRooms = await ChatRoom.find({ members: req.user._id }).populate({
//     path: 'chatMessages',
//     options: { sort: { createdAt: 'desc' }, perDocumentLimit: 10 },
//   }); // returns rooms where the currentUser is a member
//   res.status(200).json({ status: 'success', results: chatRooms.length, chatRooms });
// });

exports.getSingleChatRoom = factoryController.getSingleDoc(ChatRoom, {
  path: 'chatMessages',
  options: { sort: { createdAt: 'desc' }, limit: 10 },
}); // Populate chatMessages in the room
exports.createChatRoom = factoryController.createOne(ChatRoom);
exports.updateChatRoom = factoryController.updateOne(ChatRoom);
exports.deleteChatRoom = factoryController.deleteOne(ChatRoom);

// exports.deleteChatRoom = catchAsync(async (req, res, next) => {
//   console.log('running deleteOne');
//   const docId = req.params.id;
//   const doc = await ChatRoom.deleteOne({ _id: docId });

//   if (!doc) return next(new AppError('No document found with that ID', 404));

//   console.log('❌ document deleted successfully');

//   return res.status(204).json({ status: 'succces', data: null });
// });

// Return rooms where these 2 user ids are members
exports.getAllChatRooms = catchAsync(async (req, res, next) => {
  console.log('running getAllChatRooms');

  console.log(req.query);

  const queryObj = { ...req.query };
  let queryStr = JSON.stringify(queryObj);
  queryStr = JSON.parse(queryStr.replace(/\b(all)\b/g, match => `$${match}`));

  console.log(queryStr);

  // members: { _id: '60546994d69580265440a788', _id: '6024eb027e691904f4b006e4' }
  // { members: { _id: '603cede2e2d1512304ad4997' } }

  // const chatRooms = await ChatRoom.find({ members: [{ _id: '603cede2e2d1512304ad4997' }, { _id: '6024eb027e691904f4b006e4' }],})
  // const chatRooms = await ChatRoom.find({ members: { $in: [{ _id: '603cede2e2d1512304ad4997' }, { _id: '6024eb027e691904f4b006e4' }] },})
  // {{URL}}/api/v1/rooms?members[all]=605ca93de8a5cd08b04ae4e5&members[all]=6033a9fae16ec73670656ba2
  // marlies: 6033a9fae16ec73670656ba2
  // mickey:  6024eb027e691904f4b006e4
  // bobby:   603cede2e2d1512304ad4997

  const chatRooms = await ChatRoom.find(queryStr).populate({
    path: 'chatMessages',
    options: { sort: { createdAt: 'desc' }, perDocumentLimit: 10 },
  });
  res.status(200).json({ status: 'success', results: chatRooms.length, chatRooms });
});
