const express = require('express');

const router = express.Router();

// Chat Message Endpoint: /api/v1/users

// import CRUD actions / handlers
const { signUp, login } = require('../controllers/authController');

router.route('/signup').post(signUp);
router.route('/login').post(login);

module.exports = router;
