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

const ChatMessage = mongoose.model('ChatMessage', messageSchema);

module.exports = { ChatMessage };
