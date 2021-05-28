process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION ❌ Shutting down...');
  console.log(err.name, err.message);
  console.log(err);
  process.exit(1);
});

// disable this in development
const fs = require('fs');
let options = {
  key: fs.readFileSync('/etc/ssl/private/wildcard_dnk_nl_2021.key'),
  cert: fs.readFileSync('/etc/ssl/certs/wildcard_dnk_nl_2021.crt'),
  requestCert: false,
};

const express = require('express');
const app = express();
const server = require('https').createServer(options, app); // https
// const server = require('http').createServer(app); // http (development)
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const AppError = require('./util/appError');
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
// const hpp = require('hpp');

// Connect server to socket.io
const io = (exports.io = require('socket.io')(server, {
  cors: {
    origin: true,
    credentials: true,
  },
}));
const socketManager = require('./util/socketManager');

io.on('connection', socketManager);

// Routers
const chatMessageRouter = require('./routes/chatMessageRouter');
const userRouter = require('./routes/userRouter');
const chatRoomRouter = require('./routes/chatRoomRouter');
const currentUserRouter = require('./routes/currentUserRouter');

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

// app.use((req, res, next) => {
//   console.log('Cookie:');
//   console.log(req.cookies);
//   next();
// });

// Body Parser - Reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data Sanitization against NoSQL query injection by removing mongoDB operators ($, .)
app.use(mongoSanitize());

// Data Sanitization against XSS attacks (removes things like html tags <script></script>)
app.use(xssClean());

// Prevent Parameter Pollution (http parameter pollution)
// app.use(hpp());

// Routers
app.use('/api/v1/chatMessages', chatMessageRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/rooms', chatRoomRouter);
app.use('/api/v1/getCurrentLoggedInUser', currentUserRouter);

// App Config
const port = process.env.PORT || 9000;

// https://www.youtube.com/watch?v=gzdQDxzW2Tw&t=197s 3:09

// https://www.youtube.com/watch?v=SYP54qp4aMM 13:32

// app.use(express.static('client/build'));

// app.get('*', (req, res) => {
//   res.send(path.resolve(__dirname, 'client', 'build', 'index.html'));
// });

// UDEMY JONAS:
// app.set(express.static(path.join(__dirname, 'uploads/avatars')));
app.use(express.static('uploads/avatars'));

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
