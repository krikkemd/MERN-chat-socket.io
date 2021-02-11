process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEOPTION ❌ Shutting down...');
  console.log(err.name, err.message);
  console.log(err);
  process.exit(1);
});

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const AppError = require('./util/appError');
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
// const hpp = require('hpp');

// Connect server to socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

// Socket.io RECEIVE from client types
const { CREATE_CHAT_MESSAGE, DELETE_CHAT_MESSAGE } = require('./types/types');

// Socket.io RETURN to clients types
const { OUTPUT_CHAT_MESSAGE, DELETED_CHAT_MESSAGE } = require('./types/types');

// Routers
const chatMessageRouter = require('./routes/chatMessageRouter');
const userRouter = require('./routes/userRouter');

// Mongoose
const mongoose = require('mongoose');

// Middleware
const limiter = rateLimit({
  max: 3600,
  windowMs: 1000 * 60 * 60,
  message: 'Too many requests from this IP, please try again in an hour',
});

// Set HTTP security headers
app.use(helmet());

// Limit the use of API with 3600 requests per IP per hour (1 message per second)
app.use('/api', limiter);
app.use(cors());

// Body Parser - Reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NoSQL query injection by removing mongoDB operators ($, .)
app.use(mongoSanitize());

// Data Sanitization against XSS attacks (removes things like html tags <script></script>)
app.use(xssClean());

// Prevent Parameter Pollution (http parameter pollution)
// app.use(hpp());

app.use('/api/v1/chatMessages', chatMessageRouter);
app.use('/api/v1/users', userRouter);

// App Config
dotenv.config();
const port = process.env.PORT || 9000;

// Connect to the DB
mongoose.connect(process.env.CONNECTION_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
const endpoint = 'http://localhost:1337/api/v1/chatMessages';

// Once the db is connected
db.once('open', () => {
  console.log('success, connected to DB');

  // Listen for users connecting
  io.on('connection', socket => {
    console.log('🧙‍♂️ a user connected');

    // Listen to incoming chatMessages emits from clients connected with socket.io
    socket.on(CREATE_CHAT_MESSAGE, message => {
      return axios
        .post(`${endpoint}`, message)
        .then(res => {
          console.log(
            '✅ message from socket.io-client successfully stored in DB, emit message back to all clients from changeStream',
          );
          return res.data;
        })
        .catch(err => {
          console.log(err);
        });
    });

    // Listen to incoming DELETE emits from clients connected with socket.io
    socket.on(DELETE_CHAT_MESSAGE, chatMessageId => {
      axios
        .delete(`${endpoint}/${chatMessageId}`)
        .then(res => {
          console.log('deleted successfully');
          console.log(
            '❌ message from socket.io-client successfully deleted from DB, emit back to all clients from changeStream',
          );
          return res.data;
        })
        .catch(err => {
          console.log(err);
        });
    });

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
      console.log(message);

      // Return chatMessage Back to client
      return io.emit(OUTPUT_CHAT_MESSAGE, message);

      // Send the inserted document back to the client
      //   return io.emit('INSERT change stream message', message);

      // DELETE MESSAGE ON CHANGE
    } else if (change.operationType === 'delete') {
      const messageId = change.documentKey._id;
      console.log(messageId);
      return io.emit(DELETED_CHAT_MESSAGE, messageId);
    }

    // // DROP COLLECTION CHANGE
    // else if (change.operationType === 'drop') {
    //   return io.emit('DROP change stream collection', '💣 BOOM Collection DROPPED!');
    // } else {
    //   console.log('NO CHECK FOR THIS, CHECK CHANGESTREAM 🌊');
  });
});

// https://www.youtube.com/watch?v=gzdQDxzW2Tw&t=197s 3:09

// https://www.youtube.com/watch?v=SYP54qp4aMM 13:32

// app.use(express.static('client/build'));

// app.get('*', (req, res) => {
//   res.send(path.resolve(__dirname, 'client', 'build', 'index.html'));
// });

// If route is not found on the server. When you put a parameter in next it is automatically and error.
app.all('*', (req, res, next) => {
  return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error Handling
app.use(errorController);

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION ❌ Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

// console.log(app.get('env'));
console.log(process.env.NODE_ENV);

// Listen
server.listen(port, () => console.log(`hello, listening on port: ${port}`));
