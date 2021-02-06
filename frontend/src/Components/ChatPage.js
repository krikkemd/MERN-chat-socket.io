import { useEffect, useState, useRef } from 'react';
// import io from 'socket.io-client';
// import moment from 'moment';

// CSS
import '../css/Chat.scss';

// Redux
import { connect } from 'react-redux';

// Redux Actions
import {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
} from '../redux/actions/chatMessageActions';

// Emit to server types
import { CREATE_CHAT_MESSAGE, DELETE_CHAT_MESSAGE } from '../redux/types';

// Receive from server types:
import { OUTPUT_CHAT_MESSAGE, DELETED_CHAT_MESSAGE } from '../redux/types';

// Backend url
// let server = 'http://localhost:1337';

// Connect client to the backend with socket
// const socket = io(server);

const ChatPage = props => {
  // Props
  console.log(props);

  // Local State
  const [chatMessage, setChatMessage] = useState('');

  // ComponentDidMount: fetch all chats messages once
  useEffect(() => {
    props.getAllChatMessages();
  }, []);

  useEffect(() => {
    // Listen to incoming chatMessages from the backend
    props.socket.on(OUTPUT_CHAT_MESSAGE, messageFromBackend => {
      console.log(messageFromBackend);
      // Dispatch messageFromBackend to the chatMessageReducer, to update the state/props to rerender
      props.createChatMessage(messageFromBackend);
    });

    // Listen to incoming ID's from deleted chatMessages from the backend / db
    props.socket.on(DELETED_CHAT_MESSAGE, messageIdFromBackEnd => {
      // console.log(messageFromBackend);
      props.deleteChatMessage(messageIdFromBackEnd);
    });
  }, []);

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

    // Mock user data from redux for example
    let userId = '123';
    let username = 'props.user.username';
    // let timestamp = moment();
    let sender = true;

    // Emit the chatMessage to the backend
    props.socket.emit(CREATE_CHAT_MESSAGE, {
      // _id: Math.floor(Math.random() * 1000),
      body: chatMessage,
      username,
      sender,
      userId,
    });

    setChatMessage('');
  };

  // Render
  return (
    <div className='chat'>
      <h1>Chat</h1>
      <div>
        {/* map through redux state, and output chatMessages on the page */}
        {props.data.chatMessages?.map(message => {
          return (
            <div key={message._id}>
              <button
                onClick={() => {
                  props.socket.emit(DELETE_CHAT_MESSAGE, message._id);
                }}>
                X
              </button>
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
    data: state.data,
  };
};

export default connect(mapStateToProps, {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
})(ChatPage);
