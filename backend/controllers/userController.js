const { User } = require('../models/UserModel');
const catchAsync = require('../util/catchAsync');

exports.getAllUsers = async (req, res, next) => {
  console.log('running getAllUsers');
  try {
    const users = await User.find();
    res.status(200).json({ status: 'success', results: users.length, users });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
    });
  }
};

exports.UpdateMe = async (req, res, next) => {
  console.log('running updateMe');

  // 1) if user tries to update password, send error. Use /updatePassword PATCH authcontroller.

  if (req.body.password || req.body.passwordConfirm) {
    return res.status(400).json({
      status: 'failed',
      message:
        'This route is not for updating your password. Please make a PATCH request to /updateMyPassword',
    });
  }

  const cleanedReqBody = cleanReqBody(req.body, 'username', 'email');

  // 2) update user data with the cleaned req.body object
  const user = await User.findByIdAndUpdate(req.user._id, cleanedReqBody, {
    new: true, // returns the updates doc
    runValidators: true,
  });

  console.log(user);

  return res.status(200).json({ status: 'success', user });
};

// Set users active state to false
exports.deleteMe = async (req, res, next) => {
  console.log('running deleteme');
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  console.log(user);

  res.status(204).json({ status: 'success' });
};

// helper function to clean the req.body so user can only change values that are allowed.
const cleanReqBody = (reqBody, ...allowedValuesToChangeOnDoc) => {
  let cleanedReqBody = {};
  console.log('filtering req.body');
  console.log(reqBody);
  Object.keys(reqBody).forEach(el => {
    if (allowedValuesToChangeOnDoc.includes(el)) {
      cleanedReqBody[el] = reqBody[el];
    }
  });
  return cleanedReqBody;
};
