const AppError = require('../util/appError');

const sendErrorsInDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorsInProduction = (err, res) => {
  // Operational error: send to client

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming error: don't leak to client
  } else {
    console.error('❌ PROGRAMMING ERROR!', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }
};

// Helper function in PROD, make it an operational error easy to read message for the client.
const handleCastError = err => {
  const message = `Invalid ${err.path}: ${err.value._id}, `;
  return new AppError(message, 400);
};

const handleDuplicateFieldValue = err => {
  const value = Object.keys(err.keyValue)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}, please use another value.`;

  return new AppError(message, 400);
};

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(error => ` ${error.message}`);
  console.log(errors);

  const message = `Invalid input data:${[...errors]}`;

  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // In development we want as much information about the error as possible
  if (process.env.NODE_ENV === 'development') {
    sendErrorsInDevelopment(err, res);
  }

  // In production we send more generic errors
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name };
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFieldValue(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);

    sendErrorsInProduction(error, res);
  }
};
