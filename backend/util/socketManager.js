const io = require('../server').io;
const dotenv = require('dotenv');

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
      return io.emit(OUTPUT_CHAT_MESSAGE, message);

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

  //userconnects 2
  socket.on(USER_CONNECTED, user => {
    user.socketId = socket.id;
    console.log(user);
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user.username;
    // sendMessageToChatFromUser = sendMessageToChat(user.name);
    // sendTypingFromUser = sendTypingToChat(user.name);

    console.log(connectedUsers);
    io.emit(USER_CONNECTED, connectedUsers);
  });

  // PRIVATE MESSAGE, WE SHOULD DYNAMICALLY STORE ROOM NAMES ON CONNECT:
  // https://stackoverflow.com/questions/30347923/socket-io-emit-to-array-of-socket-id/30369176
  // on connect push socket id to array. and join all other connected users?
  // https://socket.io/docs/v3/emit-cheatsheet/
  // socket.user = req.user._id
  // socket.user === props.user._id ? send message : return false
  // map through connected users. for each connected user, create a 1 to 1 room?

  // socket.on('private message', (anotherSocketId, msg) => {
  //   socket.to(anotherSocketId).emit('private message', socket.id, msg);
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
