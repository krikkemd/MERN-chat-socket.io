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
  logout,
} = require('../controllers/authController');

const {
  getAllUsers,
  updateMe,
  deleteMe,
  getSingleUser,
  uploadUserAvatar,
  resizeUserAvatar,
} = require('../controllers/userController');

// Auth
router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:resetToken', resetPassword);

// Protect routes from this point forward
router.use(protectRoute);

router.patch('/updateMyPassword', updateMyPassword);

// User crud
router.route('/').get(getAllUsers);
router.route('/:id').get(getSingleUser);

// Logged in user change own data
router.patch('/updateMe', uploadUserAvatar, resizeUserAvatar, updateMe);
router.delete('/deleteMe', deleteMe);

module.exports = router;
