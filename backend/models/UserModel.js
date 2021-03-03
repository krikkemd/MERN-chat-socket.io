const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'username is required'],
      unique: true,
      minlength: [2, 'username should have a minimum length of 2 characters'],
      maxlength: [50, 'username max length is 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'please provide a valid email'],
    },
    avatar: {
      type: String,
      default: 'no-img.png',
    },
    // IEDEREEN KAN ROLE ZETTEN VIA POSTMAN. MOET HANDMATIG IN DB
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'please provide a password'],
      minlength: 10,
      maxlength: [50, 'password max length is 50 characters.'],
      select: false, // select false: never send this back in responses, when reading from db
    },

    passwordConfirm: {
      type: String,
      required: [true, 'please confirm your password'],
      select: false,

      validate: {
        // returns true or false. This validator only works on CREATE and SAVE!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords don't match",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    expireAt: {
      type: Date,
      // default: Date.now,
      index: { expires: null },
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// PRE SAVE MIDDLEWARE WONT WORK WITH FINDONEANDUPDATE, JUST USE SAVE OR CREATE

// Encrypt users password before saving user to the DB
userSchema.pre('save', async function (next) {
  // 'this' refers to the current document, so in this case to the current user

  // If the password has not been modified, exit this function
  if (!this.isModified('password')) return next();

  // encrypt password
  this.password = await bcrypt.hash(this.password, 12);

  // remove passwordConfirm after encrypting the password, we only need it to make sure the password is typed correctly
  this.passwordConfirm = undefined;
  next();
});

// Method to compare passwords, available to all user documentens in the collection
userSchema.methods.checkIfPasswordsMatch = async function (passedInPassword, password) {
  return await bcrypt.compare(passedInPassword, password);
};

// Check if user has changed his password after JWT was issued
userSchema.methods.changedPasswordAfterJWT = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // Format timestamp to Unix Epoch time
    const formattedPasswordChangedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(formattedPasswordChangedTime, JWTTimestamp);

    // Check if the user has changed his password, AFTER the JWT was issued.
    // JWT iat:           2020-02-06
    // Password changed:  2020-02-07
    // Deny access

    // JWT iat:           today 12.00
    // Password changed:  today 13.00
    // Deny access

    // JWT iat:           today: 14.00
    // Password changed:  yesterday
    // Allow access

    // if the user changes password after JWT was issued
    // So user HAS changed password after JWT was issued: DENY ACCESS
    console.log(
      `Has user changed password after JWT was issued? ${
        formattedPasswordChangedTime > JWTTimestamp
      }`,
    );
    return formattedPasswordChangedTime > JWTTimestamp;
  }

  // False means the password has NOT been changed after the JWT was issued
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // create reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // store encrypted version of the reset token on the current user document inside the db
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // store an expirydate on the current user document inside the db
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // resetToken = unencrypted
  // this.passwordResetToken = encrypted, saved in db
  console.log({ resetToken }, this.passwordResetToken);

  // email unencrypted token
  return resetToken;
};

// Set passwordChangedAt timestamp if password has been changed.
userSchema.pre('save', function (next) {
  // if password is NOT changed, or the user document is new. return from function,
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // minus one second in case the JWT gets issued faster
  next();
});

// query middleware that filters out users with active set to false.
userSchema.pre(/^find/, function (next) {
  console.log('running pre find queryMiddleware from userModel.js');
  // $ne will return all users even with the active property not set
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
