process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION ❌ Shutting down...');
  console.log(err.name, err.message);
  console.log(err);
  process.exit(1);
});

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cookieParser = require('cookie-parser');
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
    origin: true,
    credentials: true,
  },
});

// Socket.io RETURN to clients types
const { OUTPUT_CHAT_MESSAGE, DELETED_CHAT_MESSAGE } = require('./types/types');

// Routers
const chatMessageRouter = require('./routes/chatMessageRouter');
const userRouter = require('./routes/userRouter');
const groupRouter = require('./routes/groupRouter');
const currentUserRouter = require('./routes/currentUserRouter');

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

// CORS
// app.use(cors());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
// app.options('*', cors());

// Cookie Parser
app.use(cookieParser());

app.use((req, res, next) => {
  console.log('Cookie:');
  console.log(req.cookies);
  next();
});

// Body Parser - Reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NoSQL query injection by removing mongoDB operators ($, .)
app.use(mongoSanitize());

// Data Sanitization against XSS attacks (removes things like html tags <script></script>)
app.use(xssClean());

// Prevent Parameter Pollution (http parameter pollution)
// app.use(hpp());

// Routers
app.use('/api/v1/chatMessages', chatMessageRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/groups', groupRouter);
app.use('/api/v1/getCurrentLoggedInUser', currentUserRouter);

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

// Once the db is connected
db.once('open', () => {
  console.log('success, connected to DB');

  // Listen for users connecting
  io.on('connection', socket => {
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
    // Listen to incoming chatMessages emits from clients connected with socket.io
    // axios.defaults.withCredentials = true;

    // socket.on(CREATE_CHAT_MESSAGE, message => {
    //   return axios
    //     .post(`${endpoint}`, message)
    //     .then(res => {
    //       console.log(
    //         '✅ message from socket.io-client successfully stored in DB, emit message back to all clients from changeStream',
    //       );
    //       // return res.data;
    //     })
    //     .catch(err => {
    //       console.log(err);
    //     });
    // });

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

      // DELETE MESSAGE ON CHANGE
    } else if (change.operationType === 'delete') {
      const messageId = change.documentKey._id;
      console.log(messageId);
      return io.emit(DELETED_CHAT_MESSAGE, messageId);
    }
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
