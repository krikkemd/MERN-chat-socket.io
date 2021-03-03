const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');

exports.getAllDocuments = Model => {
  return catchAsync(async (req, res, next) => {
    console.log('running getAlldocs');
    const docs = await Model.find();

    return res.status(200).json({
      status: 'success',
      results: docs.length,
      docs,
    });
  });
};

// you should call populate for each passed in parameter
exports.getSingleDoc = (Model, ...fieldsToPopulate) => {
  return catchAsync(async (req, res, next) => {
    console.log('running getSingleDoc');
    const docId = req.params.id;
    console.log(fieldsToPopulate);

    const doc = await Model.findById({ _id: docId }).populate(...fieldsToPopulate);

    if (!doc) return next(new AppError('No document found with that ID', 404));

    return res.status(200).json({
      status: 'success',
      doc,
    });
  });
};

exports.createOne = Model => {
  return catchAsync(async (req, res, next) => {
    console.log('running createOne');
    const doc = await Model.create(req.body);

    console.log('✅ new document created');
    console.log(doc);

    return res.status(201).json({
      status: 'success',
      doc,
    });
  });
};

exports.updateOne = Model => {
  return catchAsync(async (req, res, next) => {
    console.log('running deleteOne');
    const docId = req.params.id;
    const doc = await Model.findByIdAndUpdate(docId, req.body, { new: true, runValidators: true });

    if (!doc) return next(new AppError('No document found with that ID', 404));

    console.log(' ✅ document updated successfully');

    return res.status(200).json({ status: 'succces', data: doc });
  });
};

exports.deleteOne = Model => {
  return catchAsync(async (req, res, next) => {
    console.log('running deleteOne');
    const docId = req.params.id;
    const doc = await Model.findByIdAndDelete({ _id: docId });

    if (!doc) return next(new AppError('No document found with that ID', 404));

    console.log('❌ document deleted successfully');

    return res.status(204).json({ status: 'succces', data: null });
  });
};
