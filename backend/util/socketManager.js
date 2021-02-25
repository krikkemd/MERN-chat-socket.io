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
});

module.exports = socket => {
  console.log('🧙‍♂️ a user connected');

  // user connects
  socket.on(USER_CONNECTED, async user => {
    user.socketId = socket.id;
    console.log(user);
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user.username;

    // Get all the chatRooms where the user is a member
    const chatRooms = await ChatRoom.find({ members: user._id }); // returns rooms where the currentUser is a member

    // create a socket.io Room for each ChatRoom the user is a member of
    // chatRooms.forEach(room => socket.join(room._id.toString()));

    console.log(connectedUsers);
    io.emit(USER_CONNECTED, connectedUsers);
  });

  let roomArray = [];

  // JOIN THE ROOM THAT IS CLICKED ON. ADD IT TO THE ROOMARRAY. LEAVE ALL OTHER ROOMS THAT ARE NOT EQUAL TO PASSED IN ROOMID
  socket.on('roomId', roomId => {
    console.log('oi');

    socket.join(roomId.toString());

    if (roomArray.includes(roomId)) {
      console.log('✅');
    } else {
      roomArray.push(roomId);
      console.log('❌');
    }

    // room id that is clicked
    console.log(roomArray);
    roomArray.map(room => {
      if (room !== roomId) {
        socket.leave(room.toString());
      }
    });

    // alle rooms
    console.log(socket.rooms);

    // current user id
    console.log(socket.id);

    // return io.in(message.chatRoomId.toString()).emit(OUTPUT_CHAT_MESSAGE, message);
  });

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
  newList[user.username] = user.socketId;
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
