const express = require('express');

const router = express.Router();

// Chat Message Endpoint: /api/v1/users

// import CRUD actions / handlers
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updateMyPassword,
  protectRoute,
} = require('../controllers/authController');

const { getAllUsers, UpdateMe, deleteMe } = require('../controllers/userController');

// Auth
router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:resetToken', resetPassword);
router.patch('/updateMyPassword', protectRoute, updateMyPassword);

// User crud
router.route('/').get(protectRoute, getAllUsers);

// Logged in user change own data
router.patch('/updateMe', protectRoute, UpdateMe);
router.delete('/deleteMe', protectRoute, deleteMe);

module.exports = router;
