const { User } = require('../models/UserModel');
const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');
const factoryController = require('./factoryController');
const multer = require('multer');
const sharp = require('sharp');
// TODO: set ExpiresAt when user deleteMe. create functionality when user re-activates account. signup function active false is not good.

// Location to store uploaded images (error first)
// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, '../frontend/public');
//   },
//   filename: (req, file, callback) => {
//     const extention = file.mimetype.split('/')[1];
//     callback(null, `user-${req.user._id}-${Date.now()}.${extention}`);
//   },
// });

// stores img in memory as a buffer
const multerStorage = multer.memoryStorage();

// Check if uploaded file is an image
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(new AppError('Uploaded file is not an image.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserAvatar = upload.single('avatar');

exports.resizeUserAvatar = (req, res, next) => {
  if (!req.file) return next();
  console.log('running resizdeUserAvatar');

  console.log(req.file);

  // define the filename, because we store it in memory so the filename is not set
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  // resize and crop the image
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`../frontend/public/${req.file.filename}`);

  next();
};

exports.getAllUsers = factoryController.getAllDocuments(User);
exports.getSingleUser = factoryController.getSingleDoc(User);

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   console.log('running getAllUsers');
//   const users = await User.find();
//   res.status(200).json({ status: 'success', results: users.length, users });
// });

// TODO: When user update username for example, username should be changed on all chatmessages
exports.updateMe = catchAsync(async (req, res, next) => {
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

  // Only Username and Email are allowed here. can add more if needed.
  const cleanedReqBody = cleanReqBody(req.body, 'username', 'email');
  if (req.file) cleanedReqBody.avatar = req.file.filename;

  // 2) update user data with the cleaned req.body object
  const user = await User.findByIdAndUpdate(req.user._id, cleanedReqBody, {
    new: true, // returns the updated doc
    runValidators: true,
  });

  if (!user) return next(new AppError('No document found with that ID', 404));

  console.log('updateMe User:');
  console.log(user);
  return res.status(200).json({ status: 'success', user });
});

// Set users active state to false
exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log('running deleteMe');
  const user = await User.findByIdAndUpdate(req.user.id, {
    active: false,
    expireAt: Date.now() + 1000 * 60 * 10, // 10 minutes
  });

  if (!user) return next(new AppError('No document found with that ID', 404));

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
