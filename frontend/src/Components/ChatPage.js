import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
// import moment from 'moment';
// import axios from 'axios';

// CSS
import '../css/Chat.scss';

import {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
} from '../redux/actions/chatMessageActions';

let server = 'http://localhost:1337';
const socket = io(server);

const ChatPage = () => {
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

    getAllChatMessages()
      .then(res => {
        console.log(res);
        setMessages(res.data.chatMessages);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

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

    // Listen for chat messages sent back from server, after the message is inserted into the db
    socket.on('INSERT change stream message', messageFromBackend => {
      console.log(messageFromBackend);
      setMessages(prevProps => [...prevProps, messageFromBackend]);
    });

    socket.on('DELETE change stream message', messageFromBackend => {
      console.log(messageFromBackend);
      setMessages(prevProps => prevProps.filter(message => message._id !== messageFromBackend));
    });

    socket.on('DROP change stream collection', messageFromBackend => {
      console.log(messageFromBackend);
      setMessages([]);
    });
    // return () => {
    //   console.log('ComponentWillUnmount');
    //   socket.disconnect();
    // };
  }, []);

  //   Local funcions
  // const deleteChatMessage = id => {
  //   console.log(messages);
  //   axios.delete(`${server}/api/v1/chatMessages/${id}`);
  //   // socket.emit('❌ DELETE chat message', id);
  //   // setMessages(messages.filter(message => message._id !== id));
  // };

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

    createChatMessage({
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
        {messages?.map(message => {
          return (
            <div key={message._id}>
              <button onClick={e => deleteChatMessage(message._id)}>X</button>
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

export default ChatPage;
