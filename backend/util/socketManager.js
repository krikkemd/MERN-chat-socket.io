const io = require('../server').io;
const dotenv = require('dotenv');
const { ChatRoom } = require('../models/ChatRoomModel');

dotenv.config();

// Mongoose
const mongoose = require('mongoose');

// Connect to the DB
mongoose.connect(process.env.CONNECTION_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

// Socket.io RETURN to clients types
const {
  USER_CONNECTED,
  USER_DISCONNECTED,
  OUTPUT_CHAT_MESSAGE,
  DELETED_CHAT_MESSAGE,
  CREATED_CHAT_ROOM,
  EMIT_CREATED_CHAT_ROOM,
  MEMBERS_JOIN_NEW_CHAT_ROOM,
  UPDATE_AVATAR,
  LEAVE_CHATROOM,
  LEFT_CHATROOM,
} = require('../types/types');

let connectedUsers = {};

// Once the db is connected
db.once('open', () => {
  console.log('success, connected to DB');

  // CHANGESTREAM SECTION - sending data back to client after changes inside db collection.
  const messageCollection = db.collection('chatmessages');

  // Watch the chat messages collection for changes
  const changeMessageStream = messageCollection.watch();

  changeMessageStream.on('change', change => {
    console.log(change);

    // INSERT MESSAGE ON CHANGE
    // When a chat message is inserted into the db
    if (change.operationType === 'insert') {
      const message = change.fullDocument;
      console.log(message);

      // Return chatMessage Back to client
      // return io.emit(OUTPUT_CHAT_MESSAGE, message);
      return io.in(message.chatRoomId.toString()).emit(OUTPUT_CHAT_MESSAGE, message);

      // socket.on('private message', (anotherSocketId, msg) => {
      //   socket.to(anotherSocketId).emit('private message', socket.id, msg);
      // });

      // DELETE MESSAGE ON CHANGE
    } else if (change.operationType === 'delete') {
      const messageId = change.documentKey._id;
      console.log(messageId);
      return io.emit(DELETED_CHAT_MESSAGE, messageId);
    }
  });

  // CHANGESTREAM CHATROOMS
  const chatRoomCollection = db.collection('chatrooms');

  // Watch the chat messages collection for changes
  const changeChatRoomStream = chatRoomCollection.watch();

  changeChatRoomStream.on('change', change => {
    console.log(change);

    // On insert chatRoom
    if (change.operationType === 'insert') {
      const room = change.fullDocument;
      console.log(room);

      // Return chatMessage Back to client
      // return io.emit(OUTPUT_CHAT_MESSAGE, message);
      // return io.in(room.chatRoomId.toString()).emit(OUTPUT_CHAT_MESSAGE, message);

      // socket.on('private message', (anotherSocketId, msg) => {
      //   socket.to(anotherSocketId).emit('private message', socket.id, msg);
      // });
    }
  });
});

module.exports = socket => {
  console.log('🧙‍♂️ a user connected');

  // user connects
  socket.on(USER_CONNECTED, async user => {
    console.log('USER_CONNECTED');
    user.socketId = socket.id;
    console.log(user);
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user.username;

    // Get all the chatRooms where the user is a member
    const chatRooms = await ChatRoom.find({ members: user._id }); // returns rooms where the currentUser is a member

    // create a socket.io Room for each ChatRoom the user is a member of
    chatRooms.forEach(room => socket.join(room._id.toString()));

    console.log(connectedUsers);
    io.emit(USER_CONNECTED, connectedUsers);
  });

  // Clients emits new created chatroom to the server.
  socket.on(CREATED_CHAT_ROOM, chatRoomFromClient => {
    // console.log('CREATED_CHAT_ROOM');
    // console.log('connected users:');
    // console.log(connectedUsers);
    // console.log('chatroom from client');
    // console.log(chatRoomFromClient);
    // socket.join(chatRoomFromClient._id.toString());
    // console.log('socket.rooms:');
    // console.log(socket.rooms);

    // the server sends the new created chatroom back to all connected clients.
    // if the connected client is member of the new created chatroom, it will emit MEMBERS_JOIN_NEW_CHAT_ROOM
    io.emit(EMIT_CREATED_CHAT_ROOM, chatRoomFromClient);
  });

  // members of the new created chat room socket.join the chatroom
  socket.on(MEMBERS_JOIN_NEW_CHAT_ROOM, chatRoomFromClient => {
    console.log('MEMBERS JOINING ROOMS');
    console.log(chatRoomFromClient);
    socket.join(chatRoomFromClient._id.toString());
  });

  socket.on(UPDATE_AVATAR, user => {
    console.log('UPDATE_AVATAR');
    console.log('UPDATE_AVATAR');
    console.log('UPDATE_AVATAR');
    console.log('UPDATE_AVATAR');
    console.log('UPDATE_AVATAR');
    console.log(user);
  });

  socket.on(LEAVE_CHATROOM, (roomId, leftUserId) => {
    console.log('SOCKET_ON_LEAVE_CHATROOM ❌');
    socket.leave(roomId);

    console.log(socket.rooms);
    console.log(leftUserId);
    console.log(roomId);

    io.emit(LEFT_CHATROOM, { roomId, leftUserId });

    // NU MOETEN WE EMITTEN NAAR ALLE CLIENTS IN DIE GROEP, EN VERTELLEN DAT DIE GEBRUIKER UIT DE ROOM IS, DUS DE STATE UPDATEN EN UI RERENDEREN
  });

  // let roomArray = [];

  // JOIN THE ROOM THAT IS CLICKED ON. ADD IT TO THE ROOMARRAY. LEAVE ALL OTHER ROOMS THAT ARE NOT EQUAL TO PASSED IN ROOMID
  // TODO LOOK AT THE COMPONENT USEEFFECT ORDER AND AFFECTED COMPONENTS. WE SHOULD BE ABLE TO ACCESS PROPS FROM SOCKET.ON(OUTPUT_CHAT_MESSAGE) CLIENT SIDE IN CHATMESSAGEAREA
  // socket.on('roomId', roomId => {
  //   socket.join(roomId.toString());

  //   // TEMP: FIX ABOVE
  //   if (roomArray.includes(roomId)) {
  //     console.log('✅');
  //   } else {
  //     roomArray.push(roomId);
  //     console.log('❌');
  //   }

  //   // room id that is clicked
  //   console.log(roomArray);
  //   roomArray.map(room => {
  //     if (room !== roomId) {
  //       socket.leave(room.toString());
  //     }
  //   });

  //   // alle rooms
  //   console.log(socket.rooms);

  //   // current user id
  //   console.log(socket.id);

  //   // return io.in(message.chatRoomId.toString()).emit(OUTPUT_CHAT_MESSAGE, message);
  // });

  // On user disconnecting
  socket.on('disconnect', () => {
    console.log('👋 user disconnected');
    console.log(socket.user);
    if (!!socket.user) {
      connectedUsers = removeUser(connectedUsers, socket.user);

      console.log(connectedUsers);

      io.emit(USER_DISCONNECTED, connectedUsers);
    }
  });
};

/*
 * Adds user to list passed in.
 * @param userList {Object} Object with key value pairs of users
 * @param user {User} the user to added to the list.
 * @return userList {Object} Object with key value pairs of Users
 */
function addUser(userList, user) {
  let newList = Object.assign({}, userList);
  // newList[user.username] = user.socketId;
  newList[user.username] = user._id;
  // newList[user.username] = { userId: user._id, socketId: user.socketId };

  return newList;
}

/*
 * Removes user from the list passed in.
 * @param userList {Object} Object with key value pairs of Users
 * @param username {string} name of user to be removed
 * @return userList {Object} Object with key value pairs of Users
 */
function removeUser(userList, username) {
  let newList = Object.assign({}, userList);
  delete newList[username];
  return newList;
}
