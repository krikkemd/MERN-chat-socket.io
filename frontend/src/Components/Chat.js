import React, { useEffect, useState } from 'react';
import axios from '../axios';

import '../css/Chat.scss';

const Chat = props => {
  const { socket } = props;

  // local state
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [allowInput, setAllowInput] = useState(true);

  // ComponentDidMount
  useEffect(() => {
    console.log('componentDidMount');
    axios
      .get('/api/v1/messages')
      .then(res => {
        // Add all the messages to state
        console.log(res.data);
        setMessages(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  // Local functions
  const handleChange = e => {
    setMessage(e.target.value);
  };

  const handleDelete = messageId => {
    // e.preventDefault();
    console.log(messageId);
    console.log('message deleted');
    setMessages(messages.filter(message => message._id !== messageId));
    axios.delete(`/api/v1/messages/${messageId}`);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setAllowInput(false);
    console.log(message);
  };

  // HTML
  const messagesMarkup =
    messages.length > 0 ? (
      messages.map(message => (
        <div key={message._id} className='chat__message'>
          <button
            onClick={() => {
              handleDelete(message._id);
            }}>
            X
          </button>
          <p className='username'>{message.username}</p>
          <p className='body'>{message.body}</p>
          <p className='timestamp'>{message.timestamp}</p>
        </div>
      ))
    ) : (
      <div>There are no messages...</div>
    );

  // Render
  return (
    <div className='chat'>
      <h1>Chat</h1>
      <div className='chat__messages'>{messagesMarkup}</div>
      <form onSubmit={handleSubmit}>
        <input
          value={message}
          onChange={handleChange}
          type='text'
          placeholder='send a message...'
          disabled={!allowInput}
        />
        <button type='submit'>Submit</button>
      </form>
    </div>
  );
};

export default Chat;
