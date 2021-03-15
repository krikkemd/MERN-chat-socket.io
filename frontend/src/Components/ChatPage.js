import { useEffect, useState, useRef } from 'react';

// CSS
// import '../css/Chat.scss';

// Redux
import { connect } from 'react-redux';

// Redux Actions
import {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
  emitCreateChatMessageFromServerToAllClients,
  emitDeleteChatMessageFromServerToAllClients,
} from '../redux/actions/chatMessageActions';

// Receive from server types:
import { OUTPUT_CHAT_MESSAGE, DELETED_CHAT_MESSAGE } from '../redux/types';

const ChatPage = props => {
  // Local State
  const [chatMessage, setChatMessage] = useState('');

  const {
    socket,
    getAllChatMessages,
    emitCreateChatMessageFromServerToAllClients,
    emitDeleteChatMessageFromServerToAllClients,
  } = props;

  // ComponentDidMount: fetch all chats messages once
  useEffect(() => {
    getAllChatMessages();
  }, [getAllChatMessages]);

  // PRIVATE MESSAGE
  useEffect(() => {
    // props.socket.on('private message', privateMessageFromBackend => {
    //   console.log('PRIVATEMESSAGEEEE!!!');
    // });

    // Listen to incoming chatMessages from the backend
    socket.on(OUTPUT_CHAT_MESSAGE, messageFromBackend => {
      // Dispatch messageFromBackend to the chatMessageReducer, to update the state/props to rerender
      // props.createChatMessage(messageFromBackend);
      console.log('message from backend:');
      console.log(messageFromBackend);

      // Dispatch from here, so that the redux state is updated for all clients.
      emitCreateChatMessageFromServerToAllClients(messageFromBackend);
    });

    // Listen to incoming ID's from deleted chatMessages from the backend / db
    socket.on(DELETED_CHAT_MESSAGE, messageIdFromBackEnd => {
      emitDeleteChatMessageFromServerToAllClients(messageIdFromBackEnd);
    });
  }, [
    socket,
    emitCreateChatMessageFromServerToAllClients,
    emitDeleteChatMessageFromServerToAllClients,
  ]);

  // Scroll to bottom on new chatMessage
  const chatEnd = useRef(null);
  useEffect(() => {
    chatEnd.current.scrollIntoView({ behavior: 'smooth' });
  });

  //   Local funcions
  const handleChange = e => {
    setChatMessage(e.target.value);
  };

  const submitChatMessage = e => {
    e.preventDefault();

    // PRIVATE MESSSAGE
    props.socket.emit('private message', 'V5cb8K9FGA8P6haCAAAb', {
      body: chatMessage,
    });

    // Create chat message action
    props.createChatMessage({
      body: chatMessage,
    });

    setChatMessage('');
  };

  // Render
  return (
    <div className='chat'>
      <h1>Chat</h1>
      <div>
        {/* map through redux state, and output chatMessages on the page */}
        {props.chat.chatMessages?.map(message => {
          return (
            <div
              key={message._id}
              style={
                message.userId === props.user.user._id ? { color: 'green' } : { color: 'red' }
              }>
              <button
                onClick={() => {
                  props.deleteChatMessage(message._id);
                }}>
                X
              </button>
              <p>
                <strong>{message.username}</strong>
              </p>
              <p>{message.body}</p>
            </div>
          );
        })}
      </div>
      <form onSubmit={submitChatMessage}>
        <input
          value={chatMessage}
          onChange={handleChange}
          type='text'
          autoFocus={true}
          placeholder='send a message...'
        />
        <button style={{ display: 'none' }} type='submit'>
          Submit
        </button>
      </form>
      <div ref={chatEnd} />
    </div>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
    chat: state.chat,
    user: state.user,
  };
};

export default connect(mapStateToProps, {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
  emitCreateChatMessageFromServerToAllClients,
  emitDeleteChatMessageFromServerToAllClients,
})(ChatPage);
