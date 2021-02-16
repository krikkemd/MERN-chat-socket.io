const mongoose = require('mongoose');

// TODO: ZORG ERVOOR DAT REQ.USER IN THE MESSAGES KOMT
// pre find hook uit commenten, en userId
// Bij createMessage moet de userId vanuit req.user._id komen.
// in principe kunnen userId en username eruit. maak er 1 user field van die je kan populaten in de prefind hook

const messageSchema = new mongoose.Schema(
  {
    messageId: mongoose.Types.ObjectId,
    body: {
      type: String,
      required: [true, 'chat message cannot be empty'],
    },
    username: {
      type: String,
      // ref: 'User',
      // required: [true, 'A message should belong to a user'],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      // ref: 'User',
      required: [true, 'Message should have a userId'],
    }, // mongoose.ObjectId
    sender: Boolean,
  },
  { timestamps: true },
);

// Set _id to messageId
// messageSchema.pre('save', function (next) {
//   this.messageId = this._id;
//   next();
// });

// messageSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'userId',
//     select: '_id username',
//   });
//   next();
// });

const ChatMessage = mongoose.model('ChatMessage', messageSchema);

module.exports = { ChatMessage };
