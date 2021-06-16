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

// exports.getSingleChatRoom = factoryController.getSingleDoc(ChatRoom, {
//   path: 'chatMessages',
//   options: { sort: { createdAt: 'desc' }, limit: 10 },
// }); // Populate chatMessages in the room

exports.getSingleChatRoom = catchAsync(async (req, res, next) => {
  console.log('running getSingleDoc');
  const docId = req.params.id;

  const doc = await ChatRoom.findById({ _id: docId }).populate({
    path: 'chatMessages',
    options: { sort: { createdAt: 'desc' }, limit: 10 },
  });

  if (!doc) return next(new AppError('No document found with that ID', 404));

  // ############ check if req.user is in doc.member ###############

  let membersArray = [];

  doc.members.map(member => membersArray.push(member._id.toString()));

  // console.log('🤞🤞✌✌🤞');
  // console.log(membersArray);

  console.log('req.user._id is a member?');
  console.log(membersArray.includes(req.user._id.toString()));

  if (membersArray.includes(req.user._id.toString()) === false) {
    return next(new AppError('You are not a member of that chatroom', 403));
  }

  // ###########################

  return res.status(200).json({
    status: 'success',
    doc,
  });
});

exports.createChatRoom = factoryController.createOne(ChatRoom);
// exports.updateChatRoom = factoryController.updateOne(ChatRoom);

// update chatroom is used for adding new members to a chatroom (max 10)
// exports.updateChatRoom = catchAsync(async (req, res, next) => {
//   console.log('running updateChatRoom');

//   function hasDuplicates(arr) {
//     return arr.some(x => arr.indexOf(x) !== arr.lastIndexOf(x));
//   }

//   console.log('REQ.BODY:');
//   console.log(req.body);
//   console.log(req.body.members.length);

//   if (req.body.members.length > 10) {
//     console.log('Too many members, max 10');
//     return next(new AppError('Too many members (max 10)', 400));
//   }

//   if (hasDuplicates(req.body.members)) {
//     console.log('Duplicate elements found.');
//     return next(new AppError('Duplicate elements found.', 400));
//   }

//   const docId = req.params.id;
//   const doc = await ChatRoom.findByIdAndUpdate(docId, req.body, { new: true, runValidators: true });
//   if (!doc) return next(new AppError('No document found with that ID', 404));

//   console.log('doc');
//   console.log(doc);

//   console.log(' ✅ document updated successfully');

//   return res.status(200).json({ status: 'succces', data: doc });
// });

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
  // const doc = await ChatRoom.findByIdAndUpdate(docId, req.body, { new: true, runValidators: true });
  const oldDoc = await ChatRoom.findById(docId);
  if (!oldDoc) return next(new AppError('No document found with that ID', 404));

  console.log('doc');
  console.log(oldDoc);

  console.log('req.user._id is the chatroom mod?:');
  console.log(req.user._id.toString() === oldDoc.moderator.toString());

  if (req.user._id.toString() !== oldDoc.moderator.toString())
    return next(new AppError('You are not the chatroom mod', 403));

  const doc = await ChatRoom.findByIdAndUpdate(docId, req.body, { new: true, runValidators: true });

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

  console.log('req.query:');
  console.log(req.query);

  // Set var -> will be true or false depending on if user._id is present in req.query
  let reqUserIsMember;

  // set reqUserIsMember depending on the query
  if (!req.query.members.all) {
    // Will be true or false
    reqUserIsMember = req.query.members.includes(req.user._id.toString());
  } else if (req.query.members.all) {
    // Will be true or false
    reqUserIsMember = req.query.members.all.includes(req.user._id.toString());
  }

  console.log('req.user is a member?:');
  console.log(reqUserIsMember); // the answer

  // Deny access
  if (reqUserIsMember === false) {
    console.log('deny access');
    return next(new AppError('You are not a member of that group', 403));

    // Allow access
  } else if (reqUserIsMember === true) {
    console.log('allow access');
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
  }
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
  // let map = new Map();

  let roomsWithUnreadMessages = chatRooms.map(room => {
    // console.log(room.chatMessages.length);
    totalUnread = totalUnread + room.chatMessages.length;

    // map.set(room._id, room.chatMessages.length);

    return { roomId: room._id, unreadMessages: room.chatMessages.length };
  });
  // console.log(map);

  // let array = Array.from(map, ([value]) => ({ value }));

  let str = JSON.stringify(roomsWithUnreadMessages);

  // str = JSON.parse(str.replace(/^roomId: $/g, match => `$${match}`));

  str = str.replace(/\b(\w*roomId\w*)\b/g, match => {
    console.log(match);
    return 'lol';
  });

  console.log(str);

  res.status(200).json({ status: 'success', results: { roomsWithUnreadMessages, totalUnread } });
});
