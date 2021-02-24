const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

chatRoomSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'members',
    select: 'username',
  });
  next();
});

// Virtual populate chatMessages that belong to this room
chatRoomSchema.virtual('chatMessages', {
  ref: 'ChatMessage',
  foreignField: 'chatRoomId',
  localField: '_id',
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
module.exports = { ChatRoom };
