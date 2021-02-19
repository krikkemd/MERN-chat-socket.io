import { GET_ALL_CHAT_MESSAGES, CREATE_CHAT_MESSAGE, DELETE_CHAT_MESSAGE } from '../types';
import axios from '../../config/axios';

const baseUrl = 'http://localhost:1337/api/v1/chatMessages';

// REDUX
export const getAllChatMessages = () => dispatch => {
  // dispatch({ type: LOADING_DATA });
  axios
    .get(`${baseUrl}`)
    .then(res => {
      console.log(res);
      dispatch({
        type: GET_ALL_CHAT_MESSAGES,
        payload: res.data.chatMessages,
      });
    })
    .catch(err => {
      console.log(err.response.data);
      // dispatch({
      //   type: SET_ERRORS,
      //   payload: err.response.data,
      // });
    });
};

// Create Single Chat Message SEND ALONG COOKIE PROTECT ROUTE
export const createChatMessage = chatMessage => dispatch => {
  console.log(chatMessage);
  // dispatch({ type: LOADING_DATA });
  axios
    .post(`${baseUrl}`, chatMessage)
    .then(res => {
      console.log(res);
      // dispatch({
      //   type: CREATE_CHAT_MESSAGE,
      //   payload: res.data.chatMessage,
      // });
    })
    .catch(err => {
      console.log(err.response.data);
      // Redirect to log in page when not logged in
      window.location.replace('/login');
    });
};

// Takes in the message from backend after change in db. emit to all connected clients.
export const emitCreateChatMessageFromServerToAllClients = messageFromBackend => dispatch => {
  dispatch({
    type: CREATE_CHAT_MESSAGE,
    payload: messageFromBackend,
  });
};

// Delete Single Chat Message REDUX
export const deleteChatMessage = chatMessageId => dispatch => {
  axios
    .delete(`${baseUrl}/${chatMessageId}`)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
};

// Takes in the message from backend after change in db. emit to all connected clients.
export const emitDeleteChatMessageFromServerToAllClients = messageFromBackend => dispatch => {
  dispatch({
    type: DELETE_CHAT_MESSAGE,
    payload: messageFromBackend,
  });
};
