const express = require('express');

const router = express.Router();
const { isLoggedIn } = require('../controllers/authController');
const AppError = require('../util/appError');

// Chat Message Endpoint: /api/v1/getCurrentLoggedInUser

// Use protect route to set the req.user if jwt / cookie is valid
router.use(isLoggedIn);

// Send the current logged in user to the client
router.route('/').get(async (req, res, next) => {
  console.log('Running getCurrentLoggedInUser');
  if (req.cookies.jwt) {
    return res.status(200).json({
      currentUser: req.user,
    });
  } else {
    return next(new AppError('No current user found', 401));
    // return next();
  }
});

module.exports = router;
