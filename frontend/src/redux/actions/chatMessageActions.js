// Get all Screams
import { GET_ALL_CHAT_MESSAGES, CREATE_CHAT_MESSAGE, DELETE_CHAT_MESSAGE } from '../types';
import axios from '../../config/axios';

const endpoint = 'http://localhost:1337/api/v1/chatMessages';

export const getAllChatMessages = () => dispatch => {
  // dispatch({ type: LOADING_DATA });
  axios
    .get(`${endpoint}`)
    .then(res => {
      console.log(res);
      dispatch({
        type: GET_ALL_CHAT_MESSAGES,
        payload: res.data.chatMessages,
      });
    })
    .catch(err => {
      console.log(err);
      // dispatch({
      //   type: SET_ERRORS,
      //   payload: err.response.data,
      // });
    });
};

// Get All Chat Messages
// export const getAllChatMessages = () => {
//   return axios
//     .get(`${endpoint}`)
//     .then(res => {
//       // dispatch
//       return res;
//     })
//     .catch(err => {
//       console.log(err);
//       // dispatch SET_ERROR
//     });
// };

// Create Single Chat Message
// export const createChatMessage = chatMessage => {
//   return axios
//     .post(`${endpoint}`, chatMessage)
//     .then(res => {
//       // dispatch
//       return res;
//     })
//     .catch(err => {
//       console.log(err);
//       // dispatch SET_ERROR
//     });
// };

// Create Single Chat Message
export const createChatMessage = chatMessage => dispatch => {
  // dispatch({ type: LOADING_DATA });
  axios
    .post(`${endpoint}`, chatMessage)
    .then(res => {
      dispatch({
        type: CREATE_CHAT_MESSAGE,
        payload: res.data.chatMessage,
      });
    })
    .catch(err => {
      console.log(err);
      // dispatch({
      //   type: SET_ERRORS,
      //   payload: err.response.data,
      // });
    });
};

// // Delete Single Chat Message
// export const deleteChatMessage = chatMessageId => {
//   return axios
//     .delete(`${endpoint}/${chatMessageId}`)
//     .then(res => {
//       console.log('deleted successfully');
//       console.log(res);
//       return res;
//     })
//     .catch(err => {
//       console.log(err);
//     });
// };

// Delete Single Chat Message
export const deleteChatMessage = chatMessageId => dispatch => {
  axios
    .delete(`${endpoint}/${chatMessageId}`)
    .then(res => {
      console.log('deleted successfully');
      dispatch({
        type: DELETE_CHAT_MESSAGE,
        payload: chatMessageId,
      });
    })
    .catch(err => {
      console.log(err);
    });
};
