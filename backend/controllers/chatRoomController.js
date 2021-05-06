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
// exports.updateChatRoom = factoryController.updateOne(ChatRoom);

// update chatroom is used for adding new members to a chatroom (max 10)
exports.updateChatRoom = catchAsync(async (req, res, next) => {
  console.log('running updateChatRoom');

  function hasDuplicates(arr) {
    return arr.some(x => arr.indexOf(x) !== arr.lastIndexOf(x));
  }

  console.log('REQ.BODY:');
  console.log(req.body);
  console.log(req.body.members.length);

  if (req.body.members.length > 10) {
    console.log('Too many members, max 10');
    return next(new AppError('Too many members (max 10)', 400));
  }

  if (hasDuplicates(req.body.members)) {
    console.log('Duplicate elements found.');
    return next(new AppError('Duplicate elements found.', 400));
  }

  const docId = req.params.id;
  const doc = await ChatRoom.findByIdAndUpdate(docId, req.body, { new: true, runValidators: true });
  if (!doc) return next(new AppError('No document found with that ID', 404));

  console.log('doc');
  console.log(doc);

  console.log(' ✅ document updated successfully');

  return res.status(200).json({ status: 'succces', data: doc });
});

exports.leaveChatRoom = catchAsync(async (req, res, next) => {
  console.log('running leaveChatRoom');
  console.log(req.params);
  console.log(req.body);
  const docId = req.params.id;
  const doc = await ChatRoom.findById(docId);

  if (!doc) return next(new AppError('No document found with that ID', 404));

  console.log('✅✅✅👍✅✅');
  // console.log(doc.members);

  const memberIndex = doc.members.findIndex(member => {
    return member.id === req.user._id.toString();
  });

  console.log(doc.members[memberIndex]._id);
  console.log(doc.moderator);

  // If the leaving member is the groupMod, pass the mod to another member
  if (doc.members[memberIndex]._id.toString() === doc.moderator.toString()) {
    console.log('Group moderator left, change moderator');
    doc.members.map(member => {
      if (doc.members[memberIndex]._id !== member._id) {
        doc.moderator = member._id;
      }
    });
  }

  doc.members.splice(memberIndex, 1);

  console.log('doc leave chatroom before save:');
  console.log(doc);

  const newDoc = await doc.save();

  console.log(' ✅ document updated successfully');
  return res.status(200).json({ status: 'succces', data: newDoc });
});

exports.joinChatRoom = catchAsync(async (req, res, next) => {
  console.log('running joinChatRoom');
  console.log(req.params);
  console.log(req.body);

  const { userId } = req.body;
  const docId = req.params.id;
  const doc = await ChatRoom.findById(docId);

  if (!doc) return next(new AppError('No document found with that ID', 404));

  console.log('✅✅✅✅✅');
  console.log(doc.members);

  const memberIndex = doc.members.findIndex(member => {
    return member.id === userId.toString();
  });

  console.log(memberIndex);

  if (memberIndex === -1) {
    doc.members.push(userId);
  } else {
    return res.status(401).json({ status: 'failed', message: 'User is already in the group.' });
  }

  console.log('document just before saving:');
  console.log(doc);
  console.log(doc.members);

  const newDoc = await doc.save();

  console.log(' ✅ user joined  successfully');
  return res.status(200).json({ status: 'succces', data: newDoc });
});

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
  queryStr = JSON.parse(
    queryStr.replace(/\b(gte|gt|lte|lt|exists|size|all)\b/g, match => `$${match}`),
  );

  console.log(queryStr);

  // members: { _id: '60546994d69580265440a788', _id: '6024eb027e691904f4b006e4' }
  // { members: { _id: '603cede2e2d1512304ad4997' } }

  // const chatRooms = await ChatRoom.find({ members: [{ _id: '603cede2e2d1512304ad4997' }, { _id: '6024eb027e691904f4b006e4' }],})
  // const chatRooms = await ChatRoom.find({ members: { $in: [{ _id: '603cede2e2d1512304ad4997' }, { _id: '6024eb027e691904f4b006e4' }] },})
  // {{URL}}/api/v1/rooms?members[all]=605ca93de8a5cd08b04ae4e5&members[all]=6033a9fae16ec73670656ba2
  // members[all]=6024eb027e691904f4b006e4&members[all]=603cede2e2d1512304ad4997&members[size]=2&name[exists]=false
  // marlies: 6033a9fae16ec73670656ba2
  // mickey:  6024eb027e691904f4b006e4
  // bobby:   603cede2e2d1512304ad4997

  const chatRooms = await ChatRoom.find(queryStr).populate({
    path: 'chatMessages',
    options: { sort: { createdAt: 'desc' }, perDocumentLimit: 10 },
  });
  res.status(200).json({ status: 'success', results: chatRooms.length, chatRooms });
});

exports.getAllUnreadMessages = catchAsync(async (req, res, next) => {
  console.log('running getAllUnreadMessages');

  console.log(req.query);

  const queryObj = { ...req.query };
  let queryStr = JSON.stringify(queryObj);
  queryStr = JSON.parse(
    queryStr.replace(/\b(gte|gt|lte|lt|exists|size|all)\b/g, match => `$${match}`),
  );

  console.log(queryStr);

  // Postman: {{URL}}/api/v1/rooms/getAllUnreadMessages?[members]=6033a9fae16ec73670656ba2 (req.user._id)
  // Frontend: {{URL}}/api/v1/rooms/getAllUnreadMessages?[members]=`${user._id}`

  // Get the chatrooms where the req.user._id is not found in the members array
  const chatRooms = await ChatRoom.find(queryStr).populate({
    path: 'chatMessages',
    match: { read: { $ne: req.user._id } },
    options: { sort: { createdAt: 'desc' }, perDocumentLimit: 100 },
  });

  let totalUnread = 0;

  let roomsWithUnreadMessages = chatRooms.map(room => {
    // console.log(room.chatMessages.length);
    totalUnread = totalUnread + room.chatMessages.length;

    return { roomId: room._id, unreadMessages: room.chatMessages.length };
  });

  res.status(200).json({ status: 'success', results: { roomsWithUnreadMessages, totalUnread } });
});
