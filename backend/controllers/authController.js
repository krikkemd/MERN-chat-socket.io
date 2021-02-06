const { User } = require('../models/UserModel');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

exports.signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      // passwordChangedAt: req.body.passwordChangedAt,
    });
    console.log('✅ User successfully inserted inside DB');

    // TODO: REMOVE JWT SIGN FROM SIGNUP. SEND VALIDATION EMAIL AFTER SIGNING UP.

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
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

  // const correct = await user.checkPassword(req.body.password, user.password);
  // console.log(`password correct: ${correct}`);

  // // If there is no user, return general error
  // if (!user) {
  //   return res.status(400).json({
  //     status: 'failed',
  //     message: 'Incorrect email or password',
  //   });
  // }

  // // lecture 129
  // // Compare the req.body.password, with the user.password from the db
  // const correctPassword = await bcrypt.compare(password, user.password);
  // console.log(`Password is correct: ${correctPassword}`);

  // // If password is incorrect return general error
  // if (!correctPassword) {
  //   return res.status(400).json({
  //     status: 'failed',
  //     message: 'Incorrect email or password',
  //   });
  // }

  // if there is no user, or the password is incorrect return a general error. (checkpassword is an instance method in the USERMODEL)
  if (!user || !(await user.checkIfPasswordsMatch(req.body.password, user.password))) {
    return res.status(401).json({
      status: 'failed',
      message: 'Incorrect email or password',
    });
  }

  // When everything is OK create token
  const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Send token back to the client
  return res.status(200).json({
    status: 'success',
    token,
  });
};

exports.protectRoute = async (req, res, next) => {
  console.log(req.headers);
  // 1) check if token exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // if there is no token return error
  if (!token) return res.status(401).json({ status: 'failed', message: 'You are not logged in.' });

  // 2) if there is a token, verify token
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ err });
    return decoded;
  });

  // 3) check if the user still exists in the db. for if user was deleted after token was issued
  console.log(decodedToken);
  const user = await User.findById(decodedToken.userId);

  // if the user was deleted from db after the token was issued, return error. deny access
  if (!user) return res.status(401).json({ status: 'failed', message: 'user no longer exists' });

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
