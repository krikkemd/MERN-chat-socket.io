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
const { OUTPUT_CHAT_MESSAGE, DELETED_CHAT_MESSAGE } = require('../types/types');

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

  socket.join('✅✅✅✅ room1');

  console.log(socket.rooms);

  // PRIVATE MESSAGE, WE SHOULD DYNAMICALLY STORE ROOM NAMES ON CONNECT:
  // https://stackoverflow.com/questions/30347923/socket-io-emit-to-array-of-socket-id/30369176
  // on connect push socket id to array. and join all other connected users?
  // https://socket.io/docs/v3/emit-cheatsheet/
  // socket.user = req.user._id
  // socket.user === props.user._id ? send message : return false
  // map through connected users. for each connected user, create a 1 to 1 room?

  socket.on('private message', (anotherSocketId, msg) => {
    socket.to(anotherSocketId).emit('private message', socket.id, msg);
  });

  // On user disconnecting
  socket.on('disconnect', () => {
    console.log('👋 user disconnected');
  });
};
