import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
// import moment from 'moment';
// import axios from 'axios';

// CSS
import '../css/Chat.scss';

// Redux
import { connect } from 'react-redux';

// Actions
import {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
} from '../redux/actions/chatMessageActions';

// Backend
let server = 'http://localhost:1337';
const socket = io(server);

const ChatPage = props => {
  // console.log('rendering');
  // console.log(props.data.chatMessages);
  console.log(props);

  // Local State
  const [chatMessage, setChatMessage] = useState('');
  // const [currentSocket, setCurrentSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  // Scroll to bottom
  const chatEnd = useRef(null);
  useEffect(() => {
    chatEnd.current.scrollIntoView({ behavior: 'smooth' });
  });

  // ComponentDidMount: fetch all chats messages once
  // useEffect(() => {
  //   axios.get(`${server}/api/v1/chatMessages`).then(res => {
  //     console.log(res);
  // setMessages(res.data.chatMessages);
  //   });
  // }, []);

  // ComponentDidMount: fetch all chats messages once
  useEffect(() => {
    // (async () => {
    //   try {
    //     const res = await getAllChatMessages();
    //     console.log(res);
    //     setMessages(res.data.chatMessages);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // })();

    props.getAllChatMessages();
    // setCurrentSocket(socket);

    socket.on('REDUX OUTPUT CHAT MESSAGE', messageFromBackend => {
      console.log('code runs on client!');
      console.log(messageFromBackend);
      props.createChatMessage(messageFromBackend);
    });

    // setMessages(prevProps => [prevProps, props.chatMessages]);

    // getAllChatMessages()
    //   .then(res => {
    //     console.log(res);
    //     setMessages(res.data.chatMessages);
    //   })
    //   .catch(err => {
    //     console.log(err);
    //   });
  }, []);

  // ComponentWillReceiveProps: set state.ui.errors to the local errors state
  // useEffect(() => {
  //   console.log('setMessages to props.data.chatMessages');
  //   setMessages(props.data.chatMessages);
  // }, []);

  //   ComponentDidUpdate
  useEffect(() => {
    // For accessing the socket from outside this useEffect hook
    // setCurrentSocket(socket);
    // Listen for chat messages sent back from the server
    // socket.on('Output Chat Message', messageFromBackend => {
    //   console.log(messageFromBackend);
    //   // https://www.youtube.com/watch?v=d0plTCQgsXs PREV PROPS
    //   setMessages(prevProps => [...prevProps, messageFromBackend]);
    // });
    // currentSocket.on('REDUX OUTPUT CHAT MESSAGE', messageFromBackend => {
    //   console.log('code runs on client!');
    //   console.log(messageFromBackend);
    //   props.createChatMessage(messageFromBackend);
    // });
    // // Listen for chat messages sent back from server, after the message is inserted into the db
    // socket.on('INSERT change stream message', messageFromBackend => {
    //   console.log(messageFromBackend);
    //   console.log(props);
    //   // setMessages(prevProps => [...prevProps, messageFromBackend]);
    //   // props.createChatMessage(messageFromBackEnd);
    // });
    // socket.on('DELETE change stream message', messageFromBackend => {
    //   console.log(messageFromBackend);
    //   setMessages(prevProps => prevProps.filter(message => message._id !== messageFromBackend));
    // });
    // socket.on('DROP change stream collection', messageFromBackend => {
    //   console.log(messageFromBackend);
    //   setMessages([]);
    // });
    // return () => {
    //   console.log('ComponentWillUnmount');
    //   socket.disconnect();
    // };
  }, []);

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

    // props.createChatMessage({
    //   body: chatMessage,
    //   username,
    //   sender,
    //   userId,
    // });

    socket.emit('REDUX INSERT CHAT MESSAGE', {
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
        {/* CHANGED LOCAL STATE (MESSAGES) TO PROPS.CHATMESSAGES */}
        {props.data.chatMessages?.map(message => {
          return (
            <div key={message._id}>
              <button onClick={e => props.deleteChatMessage(message._id)}>X</button>
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
  console.log(state);
  return {
    data: state.data,
  };
};

export default connect(mapStateToProps, {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
})(ChatPage);

// export default ChatPage;
