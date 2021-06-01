const { User } = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../util/email');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

// req.user is set in the protectRoute function. it actually is the userId which is added when signing the JWT

// AFTER DELETEME FIX SIGNUP WITH "DELETED EMAIL". ALSO SET ACTIVE:FALSE WITH EXPIRY TO REALLY DELETE AFTER EXPIRED TIME
// TODO: REMOVE JWT SIGN FROM SIGNUP. SEND VALIDATION EMAIL AFTER SIGNING UP.

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
// sameSite: 'none',
// };

exports.signUp = catchAsync(async (req, res, next) => {
  console.log('running signUp');
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
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
    // sameSite: 'none',
  });

  return res.status(201).json({
    status: 'success',
    token: token,
    username: newUser.username,
    email: newUser.email,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  console.log('running login');

  const { email, password } = req.body;

  // 1) Check if there are an email and password provided
  if (!email || !password) {
    return next(new AppError('Vul een geldig email adres en wachtwoord in.', 400));
  }

  // Try to find the user in the DB, and manually get the password
  const user = await User.findOne({ email }).select('+password'); // Password field is not returned from the model. So we have to select it here.
  console.log('user from login');
  console.log(user);

  // if there is no user, or the password is incorrect return a general error. (checkpassword is an instance method in the USERMODEL)
  if (!user || !(await user.checkIfPasswordsMatch(req.body.password, user.password))) {
    return next(new AppError('Ingevulde gegevens zijn onjuist.', 401));
  }

  // When everything is OK create token
  const token = signJWT(user._id);
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60),
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
    // sameSite: 'none',
  });

  user.password = undefined;

  // Send token back to the client
  return res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protectRoute = catchAsync(async (req, res, next) => {
  console.log('running protectRoute');

  // 1) check if token exists in the headers
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    console.log('token set to jwt cookie from browser');
    token = req.cookies.jwt;
    console.log(token);
  }

  // if there is no token return error
  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  // 2) if there is a token, verify token
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new AppError('Token Invalid', 401));
    }
    return decoded;
  });

  console.log('Token:');
  console.log(decodedToken);

  // 3) check if the user still exists in the db. for if user was deleted after token was issued
  if (decodedToken) {
    const user = await User.findById(decodedToken.userId);

    // if the user was deleted from db after the token was issued, return error. deny access
    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    // 4) if the user exists, and the token is verified: check if the user has changed password after token was issued
    if (user.changedPasswordAfterJWT(decodedToken.iat)) {
      return next(new AppError('Password changed after token was issued. Please login again', 401));
    }

    // 5) Grant access to protected route

    req.user = user;

    console.log('set req.user:');
    console.log(req.user);
    // return res.status(200).json({
    //   status: 'success',
    //   token,
    //   user,
    // });
  }
  next();
});

// Middleware to restrict action to the passed in roles.
exports.restrictTo = (...roles) => {
  console.log('running restrictTo');
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError('Forbidden', 403));
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log('running forgotPassword');

  // 1) Get the user based on email
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('No user found with that email.', 404));

  // 2) Generate random reset token (instance method defined in the model)
  const resetToken = user.createPasswordResetToken();

  // manually save the user document that is updated with the encrypted reset token + expiry date in the db
  await user.save({ validateBeforeSave: false });

  // 3) email unencrypted token to the user, we will compare it later with the encrypted one in the db (see resetPassword below)
  // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  // const emailBody = `forgot password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email.`;

  // 3) email unencrypted token to the user, we will compare it later with the encrypted one in the db (see resetPassword below)
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const emailBody = `Wachtwoord vergeten? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email.`;

  // 4) try to send the email with the resetURL and the emailBody
  try {
    await sendEmail({
      email: user.email,
      subject: 'Wachtwoord Reset Token (10 min geldig)',
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
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log('running resetPassword');

  // 1) Get the unencrypted resetToken from req.params and encrypt it, so that we can compare it to the encrypted resetToken in the db
  const hashedResetToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  // 2) Get the user by the hashedResetToken, and only if it has not expired. so the passwordResetExpires time has to be > $gt Date.now()
  const user = await User.findOne({
    passwordResetToken: hashedResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Reset token invalid or expired.', 400));

  // 3) If there is a user, and the resetToken is not expired, set the new password.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) Update passwordChangedAt property for the user
  // the passwordChangedAt property is updated in the userModel with a pre save hook

  return res
    .status(200)
    .json({ status: 'success', message: 'Password changed successfully. You can login now.' });
});

// Let logged in user update his/her password
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  console.log('running updateMyPassword');

  // 1) Get user from req.user (this is set in protectRoute)
  const user = await User.findById({ _id: req.user._id }).select('+password');

  // if there is no user return error
  if (!user) return next(new AppError('You are not logged in bruv.', 401));

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
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
    // sameSite: 'none',
  });

  return res.status(200).json({
    status: 'success',
    message: 'password updated successfully',
    token,
  });
});

// check if user is logged in, similar to protect route. No errors
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    console.log('Running isLoggedIn:');
    try {
      // 1) verify token
      // const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      const decodedToken = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, decoded) => {
        return decoded;
      });

      // 2) Check if user still exists
      const currentUser = await User.findById(decodedToken.userId); //.populate('test');
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfterJWT(decodedToken.iat)) {
        return next();
      }

      req.user = currentUser;
    } catch (err) {
      // console.log(err);
      return next();
    }
  }
  next();
};
