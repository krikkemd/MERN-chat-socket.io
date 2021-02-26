import {
  GET_ALL_CHAT_MESSAGES,
  CREATE_CHAT_MESSAGE,
  DELETE_CHAT_MESSAGE,
  SET_ACTIVE_CHATROOM,
  SET_USER_CHATROOMS,
} from '../types';
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

// Get single chatRoom which include a virtual populate of the chatMessages
export const getSingleChatRoom = roomId => dispatch => {
  axios
    .get(`http://localhost:1337/api/v1/rooms/${roomId}`)
    .then(res => {
      console.log(res.data.doc.chatMessages);
      dispatch({ type: SET_ACTIVE_CHATROOM, payload: res.data.doc });
    })
    .catch(err => {
      console.log(err);
    });
};

// GetAllRooms({members: "req.user._id"}) // gets all the chatrooms where the currentUser is a member
export const getAllUserChatRooms = () => dispatch => {
  console.log('running getAllUserChatRooms');
  axios
    .get('http://localhost:1337/api/v1/rooms')
    .then(res => {
      console.log(res.data);
      dispatch({ type: SET_USER_CHATROOMS, payload: res.data.chatRooms });
    })
    .catch(err => console.log(err));
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
