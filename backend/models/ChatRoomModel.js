const mongoose = require('mongoose');
const { User } = require('./UserModel');
const { ChatMessage } = require('./ChatMessageModel');
const AppError = require('../util/appError');

const chatRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [1, 'Groepsnaam te kort'],
      maxlength: [20, 'Groepsnaam te lang, maximaal 20 tekens'],
    },
    moderator: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'a chatroom should have a moderator'],
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
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true },
);

chatRoomSchema.pre(/^find/, function (next) {
  console.log('pre find chatroom');
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

// Check the numbers of groupmembers. If there are more than 10 members, return
chatRoomSchema.pre('save', async function (next) {
  console.log('Check the numbers of groupmembers');
  console.log(this);
  const membersPromises = this.members.map(async id => await User.findById(id));

  console.log('✅✅✅✅✅✅');
  console.log(membersPromises.length);

  if (membersPromises.length > 10) {
    console.log('too many members selected');
    return next(new AppError('Groep heeft teveel leden (max 10)', 500));
  } else if (membersPromises.length < 1) {
    // OG: < 2
    console.log('❌no chatroom members, deleting chatmessages❌');
    await ChatMessage.deleteMany({ chatRoomId: { $in: [this._id] } }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        // console.log(result);
        console.log('chatmessages deleted successfully deleted');
      }
    });

    console.log('❌ No chatroom members, deleting chatroom❌');
    await ChatRoom.findByIdAndDelete(this._id, function (err) {
      if (err) console.log(err);
      console.log('chatroom deleted successfully');
    });

    // return next(new AppError('Groep heeft te weinig leden', 500));
  }

  this.members = await Promise.all(membersPromises);

  console.log(this.members.length);

  this.chatMessages = [];
  next();
});

// Virtual populate chatMessages that belong to this room
chatRoomSchema.virtual('chatMessages', {
  ref: 'ChatMessage',
  foreignField: 'chatRoomId',
  localField: '_id',
  // count: true,
});

// chatRoomSchema.post('find', async function (doc, next) {
//   console.log('RUNNING POST FIND MIDDLEWARE');

//   ChatRoom.find({ chatMessages: { $exists: true, $size: 0 } }).then(res => {
//     console.log(res);
//   });

//   next();
// });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
module.exports = { ChatRoom };
