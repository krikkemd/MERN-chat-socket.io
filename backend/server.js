const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');

// let bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Connect server to socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

// Routers
const chatMessageRouter = require('./routes/chatMessageRouter');

// Mongoose
const mongoose = require('mongoose');

// Middleware
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api/v1/chatMessages', chatMessageRouter);

// App Config
dotenv.config();
const port = process.env.PORT || 9000;

// Connect to the DB
mongoose.connect(process.env.CONNECTION_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Once the db is connected
db.once('open', () => {
  console.log('success, connected to DB');

  // Listen for users connecting
  io.on('connection', socket => {
    console.log('🧙‍♂️ a user connected');

    // On user disconnecting
    socket.on('disconnect', () => {
      console.log('👋 user disconnected');
    });
  });

  // CHANGESTREAM SECTION - sending data back to client after changes inside db collection.
  const messageCollection = db.collection('chatmessages');

  // Watch the chat messages collection for changes
  const changeStream = messageCollection.watch();

  changeStream.on('change', change => {
    console.log(change);

    // INSERT MESSAGE ON CHANGE
    // When a chat message is inserted into the db
    if (change.operationType === 'insert') {
      const message = change.fullDocument;

      // Send the inserted document back to the client
      return io.emit('INSERT change stream message', message);

      // DELETE MESSAGE ON CHANGE
      // TODO: CHECK IF DOCUMENT EXISTS BEFORE DELETING
    } else if (change.operationType === 'delete') {
      const messageId = change.documentKey._id;
      console.log(messageId);
      return io.emit('DELETE change stream message', messageId);
    }

    // DROP COLLECTION CHANGE
    else if (change.operationType === 'drop') {
      return io.emit('DROP change stream collection', '💣 BOOM Collection DROPPED!');
    } else {
      console.log('NO CHECK FOR THIS, CHECK CHANGESTREAM 🌊');
    }
  });
});

// https://www.youtube.com/watch?v=gzdQDxzW2Tw&t=197s 3:09

// https://www.youtube.com/watch?v=SYP54qp4aMM 13:32

// app.use(express.static('client/build'));

// app.get('*', (req, res) => {
//   res.send(path.resolve(__dirname, 'client', 'build', 'index.html'));
// });

// Listen
server.listen(port, () => console.log(`hello, listening on port: ${port}`));
