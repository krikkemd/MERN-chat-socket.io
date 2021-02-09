const { ChatMessage } = require('../models/ChatMessageModel');

exports.getAllChatMessages = async (req, res) => {
  try {
    const chatMessages = await ChatMessage.find();
    // return res.json(chatMessages);
    return res.status(200).json({
      status: 'success',
      results: chatMessages.length,
      chatMessages,
      // JSEND
      // data: {
      //   chatMessages,
      // },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
    });
  }
};

exports.createChatMessage = async (req, res) => {
  try {
    const newMessage = await ChatMessage.create({
      body: req.body.body,
      username: req.body.username,
      userId: req.body.userId,
      sender: req.body.sender,
      type: req.body.type,
    });

    console.log('✅ chat message created');

    // return newMessage;
    return res.status(201).json({
      status: 'success',
      chatMessage: newMessage,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      status: 'failed',
      error: err.errors.body.message,
    });
  }
};

exports.deleteChatMessage = async (req, res) => {
  const chatMessageId = req.params.id;

  // Check if the document exists in the db collection
  await ChatMessage.exists({ _id: chatMessageId }, async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        status: 'error',
        error: err.message,
      });
    } else {
      // if doc doesnt exist
      if (!result) {
        console.log(`❌ document exists: ${result}`);
        return res.status(404).json({
          status: 'failed',
          message: '404 not found',
        });

        // if doc exists
      } else if (result) {
        console.log(`✅ document exists: ${result}`);

        // try to delete the document
        try {
          await ChatMessage.deleteOne({ _id: chatMessageId }, err => {
            if (err) console.error(err.message);

            console.log('❌ chat message deleted');

            return res.status(204).json({
              status: 'success',
            });
          });
        } catch (err) {
          console.log(err);
          return res.status(500).json({
            status: 'error',
            error: err.message,
          });
        }
      }
    }
  });
};
