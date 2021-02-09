const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    messageId: mongoose.Types.ObjectId,
    body: {
      type: String,
      required: [true, 'chat message cannot be empty'],
    },
    username: String,
    userId: String, // mongoose.ObjectId
    sender: Boolean,
  },
  { timestamps: true },
);

// Set _id to messageId
// messageSchema.pre('save', function (next) {
//   this.messageId = this._id;
//   next();
// });

const ChatMessage = mongoose.model('ChatMessage', messageSchema);

module.exports = { ChatMessage };
