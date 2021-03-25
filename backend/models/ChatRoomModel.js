const mongoose = require('mongoose');
const { User } = require('./UserModel');

const chatRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [1, 'Groepsnaam te kort'],
      maxlength: [25, 'Groepsnaam te lang, maximaal 25 tekens'],
    },
    description: String,
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        min: 2,
        max: 10,
      },
    ],
    expireAt: {
      type: Date,
      // default: Date.now,
      index: { expires: null },
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

chatRoomSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'members',
    select: 'username avatar',
  });
  next();
});

// Embed the chatRoomMembers inside the chatRoom mind the CHATMESSAGES
chatRoomSchema.pre('save', async function (next) {
  const membersPromises = this.members.map(async id => await User.findById(id));
  this.members = await Promise.all(membersPromises);
  this.chatMessages = [];
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
