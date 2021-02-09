const { User } = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../util/email');

// req.user is set in the protectRoute function. it actually is the userId which is added when signing the JWT

// TODO: REMOVE JWT SIGN FROM SIGNUP. SEND VALIDATION EMAIL AFTER SIGNING UP.
// VALIDATION ERRORS NOT RETURNING ANYTHING IN POSTMAN

const signJWT = userId => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// SET SECURE TO TRUE IN PROD, check expiry time
// const cookieOptions = {
//   expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60),
//   secure: false,
//   httpOnly: true,
// };

exports.signUp = async (req, res) => {
  console.log('running signUp');
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      // passwordChangedAt: req.body.passwordChangedAt,
      // role: req.body.role,
    });
    console.log('✅ User successfully inserted inside DB');

    const token = signJWT(newUser._id);
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60),
      secure: false,
      httpOnly: true,
    });

    return res.status(201).json({
      status: 'success',
      token: token,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'failed',
      error: err,
    });
  }
};

exports.login = async (req, res) => {
  console.log('running login');

  const { email, password } = req.body;

  // 1) Check if there are an email and password provided
  if (!email || !password) {
    return res.status(400).json({
      status: 'failed',
      message: 'Please provide an email and password',
    });
  }

  // Try to find the user in the DB, and manually get the password
  const user = await User.findOne({ email }).select('+password'); // Password field is not returned from the model. So we have to select it here.
  console.log(user);

  // if there is no user, or the password is incorrect return a general error. (checkpassword is an instance method in the USERMODEL)
  if (!user || !(await user.checkIfPasswordsMatch(req.body.password, user.password))) {
    return res.status(401).json({
      status: 'failed',
      message: 'Incorrect email or password',
    });
  }

  // When everything is OK create token
  const token = signJWT(user._id);
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60),
    secure: false,
    httpOnly: true,
  });

  // Send token back to the client
  return res.status(200).json({
    status: 'success',
    token,
  });
};

exports.protectRoute = async (req, res, next) => {
  console.log('running protectRoute');

  // 1) check if token exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // if there is no token return error
  if (!token) {
    return res.status(401).json({ status: 'failed', message: 'You are not logged in.' });
  }

  // 2) if there is a token, verify token
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ status: 'failed', error: 'error in protectRoute' });
    return decoded;
  });

  console.log(decodedToken);

  // 3) check if the user still exists in the db. for if user was deleted after token was issued
  const user = await User.findById(decodedToken.userId);

  // if the user was deleted from db after the token was issued, return error. deny access
  if (!user) {
    return res.status(401).json({ status: 'failed', message: 'user no longer exists' });
  }

  // 4) if the user exists, and the token is verified: check if the user has changed password after token was issued
  if (user.changedPasswordAfterJWT(decodedToken.iat)) {
    return res.status(401).json({
      status: 'failed',
      message: 'Password changed after token was issued. Please login again',
    });
  }

  // 5) Grant access to protected route
  req.user = user;
  console.log(req.user);
  next();
};

// Middleware to restrict action to the passed in roles.
exports.restrictTo = (...roles) => {
  console.log('running restrictTo');
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ status: 'failed', message: 'forbidden' });
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  console.log('running forgotPassword');

  // 1) Get the user based on email
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return res.status(404).json({ status: 'failed', message: 'No user found with that email.' });

  // 2) Generate random reset token (instance method defined in the model)
  const resetToken = user.createPasswordResetToken();

  // manually save the user document that is updated with the encrypted reset token + expiry date in the db
  await user.save({ validateBeforeSave: false });

  // 3) email unencrypted token to the user, we will compare it later with the encrypted one in the db (see resetPassword below)
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const emailBody = `forgot password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email.`;

  // 4) try to send the email with the resetURL and the emailBody
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: emailBody,
    });

    res.status(200).json({ status: 'success', message: 'Reset token sent to email.' });
  } catch (err) {
    // If there is an error sending the email. remove the token and token expiry time from the db.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ status: 'failed', message: 'Error sending email.', error: err });
  }
};

exports.resetPassword = async (req, res, next) => {
  console.log('running resetPassword');

  // 1) Get the unencrypted resetToken from req.params and encrypt it, so that we can compare it to the encrypted resetToken in the db
  const hashedResetToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  // 2) Get the user by the hashedResetToken, and only if it has not expired. so the passwordResetExpires time has to be > $gt Date.now()
  const user = await User.findOne({
    passwordResetToken: hashedResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ status: 'failed', message: 'Reset token is invalid or expired.' });
  }

  // 3) If there is a user, and the resetToken is not expired, set the new password.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) Update passwordChangedAt property for the user
  // the passwordChangedAt property is updated in the userModel with a pre save hook

  // 5) log user in?

  return res
    .status(200)
    .json({ status: 'success', message: 'Password changed successfully. You can login now.' });
};

// Let logged in user update his/her password
exports.updateMyPassword = async (req, res, next) => {
  console.log('running updateMyPassword');

  // 1) Get user from req.user (this is set in protectRoute)
  const user = await User.findById({ _id: req.user._id }).select('+password');

  // if there is no user return error
  if (!user) {
    return res.status(404).json({ status: 'failed', message: 'User not found, please login.' });
  }

  // 2) check if the passed in password matches up with the current user password
  const correctCurrentPassword = await user.checkIfPasswordsMatch(
    req.body.currentPassword,
    user.password,
  );

  if (!correctCurrentPassword) {
    return res.status(401).json({ status: 'failed', message: 'Incorrect current password.' });
  }

  // 3) update user password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save({ validateBeforeSave: true });

  // 4) log user in with JWT
  const token = signJWT(user._id);
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60),
    secure: false,
    httpOnly: true,
  });

  return res.status(200).json({
    status: 'success',
    message: 'password updated successfully',
    token,
  });
};
