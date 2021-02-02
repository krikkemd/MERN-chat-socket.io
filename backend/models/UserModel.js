const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'username is required'],
  },
  email: {
    type: String,
    required: [true, 'email is requied'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  avatar: String,
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 10,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
  },
});

const User = mongoose.Model('User', userSchema);

module.exports = User;
