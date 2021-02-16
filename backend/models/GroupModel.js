const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please submit a group name'],
  },
  description: String,
  members: Array,
  moderator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'a group needs a group moderator'],
  },
});

GroupSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'moderator',
    select: 'username',
  });
  next();
});

const Group = mongoose.model('Group', GroupSchema);
module.exports = { Group };
