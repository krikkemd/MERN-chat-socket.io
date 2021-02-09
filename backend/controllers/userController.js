const { User } = require('../models/UserModel');
const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  console.log('running getAllUsers');
  const users = await User.find();
  res.status(200).json({ status: 'success', results: users.length, users });
});

exports.UpdateMe = catchAsync(async (req, res, next) => {
  console.log('running updateMe');

  // 1) if user tries to update password, send error. Use /updatePassword PATCH authcontroller.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for updating your password. Please make a PATCH request to /updateMyPassword',
        400,
      ),
    );
  }

  const cleanedReqBody = cleanReqBody(req.body, 'username', 'email');

  // 2) update user data with the cleaned req.body object
  const user = await User.findByIdAndUpdate(req.user._id, cleanedReqBody, {
    new: true, // returns the updates doc
    runValidators: true,
  });

  console.log('updateMe User:');
  console.log(user);
  return res.status(200).json({ status: 'success', user });
});

// Set users active state to false
exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log('running deleteMe');
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  console.log(user);
  res.status(204).json({ status: 'success' });
});

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
