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
  ADD_USERS_TO_CHATROOM,
  ADDED_USERS_TO_CHATROOM,
  SEND_USER_SOCKET,
  SEND_BACK_USER_SOCKET,
} = require('../types/types');

let connectedUsers = {};
let usersWithSocketsList = [];

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

  socket.on(SEND_USER_SOCKET, userAndSocket => {
    console.log('userAndSocket:');
    console.log(userAndSocket);

    let found = usersWithSocketsList.findIndex(user => {
      return user.user._id === userAndSocket.user._id;
    });

    console.log(`found: ${found}`);

    if (found === -1) {
      console.log('user not found, add to array');
      usersWithSocketsList.push(userAndSocket);
    } else if (found > -1) {
      console.log('user is already in array, dont add but update socketId');
      usersWithSocketsList[found].user.socketId = userAndSocket.user.socketId;
    }

    io.emit(SEND_BACK_USER_SOCKET, usersWithSocketsList);
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

  socket.on(LEAVE_CHATROOM, (roomId, user, leftRoom) => {
    console.log('SOCKET_ON_LEAVE_CHATROOM ❌');
    socket.leave(roomId);

    const leftUserId = user._id;
    const username = user.username;

    console.log(socket.rooms);
    console.log(leftUserId);
    console.log(roomId);

    io.in(roomId).emit(LEFT_CHATROOM, { roomId, leftUserId, username, leftRoom });

    // Emitten werkt, state update maar moet meer getest worden:
    // Lukt berichten sturen nog naar de groep, en andere chats, wie krijgen de berichten. Updaten de berichten nog netjes overal waar het hoort etc.
    // Een melding: "Username heeft de groep verlaten" -> dit kan ook emitted worden naar de RoomID

    // to all clients in room1
    // io.in("room1").emit(/* ... */);
  });

  socket.on(ADD_USERS_TO_CHATROOM, ({ data }, socketIds) => {
    console.log('✅ ADD_USERS_TO_CHATROOM');
    const roomId = data._id;
    console.log(data);

    console.log('roomId of the room where the socket ids need to be added:');
    console.log(roomId);

    console.log('incoming socket ids that are not yet in the room:');
    console.log(socketIds); // al gefilterd, zitten nog niet in de room

    console.log('Javascript map: https://javascript.info/map-set#iteration-over-map');
    console.log('log the maps in original state:');
    console.log(io.sockets.adapter.rooms);
    console.log(
      'Get the SET inside the MAP, the MAP is the roomId, the socketsIds are inside the SET',
    );
    console.log(io.sockets.adapter.rooms.get(roomId));

    console.log('add the socket ids to the SET');
    // io.sockets.adapter.rooms.get(roomId).add(socketIds[0]);

    socketIds.map(socketId => {
      return io.sockets.adapter.rooms.get(roomId).add(socketId);
    });

    console.log('log the maps with the added socketids');
    console.log(io.sockets.adapter.rooms);

    io.in(roomId).emit(ADDED_USERS_TO_CHATROOM, data);
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
    console.log(socket.id);

    let found = usersWithSocketsList.findIndex(user => {
      return user.user.socketId === socket.id;
    });

    console.log('user that left is present in usersWithSocketsList:');
    console.log(`found ${found} 0 = true because > -1`);

    if (found > -1) {
      usersWithSocketsList.splice(found, 1);
    }

    if (!!socket.user) {
      connectedUsers = removeUser(connectedUsers, socket.user);

      console.log(connectedUsers);

      io.emit(USER_DISCONNECTED, connectedUsers);
      io.emit(SEND_BACK_USER_SOCKET, usersWithSocketsList);
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
