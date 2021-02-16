// Get all Screams
import { GET_ALL_CHAT_MESSAGES, CREATE_CHAT_MESSAGE, DELETE_CHAT_MESSAGE } from '../types';
import axios from '../../config/axios';

const baseUrl = 'http://localhost:1337/api/v1/chatMessages';

// REDUX
export const getAllChatMessages = () => dispatch => {
  // dispatch({ type: LOADING_DATA });
  axios
    .get(`${baseUrl}`)
    .then(res => {
      // console.log(res);
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

// Create Single Chat Message REDUX
export const createChatMessage = chatMessage => dispatch => {
  // dispatch({ type: LOADING_DATA });
  dispatch({
    type: CREATE_CHAT_MESSAGE,
    payload: chatMessage,
  });
};

// Create Single Chat Message SEND ALONG COOKIE PROTECT ROUTE
// export const createChatMessage = chatMessage => dispatch => {
//   console.log(chatMessage);
//   // dispatch({ type: LOADING_DATA });
//   axios.post(`${baseUrl}`, chatMessage).then(res => {
//     console.log(res);
//     dispatch({
//       type: CREATE_CHAT_MESSAGE,
//       payload: chatMessage,
//     });
//   });
// };

// Delete Single Chat Message REDUX
export const deleteChatMessage = chatMessageId => dispatch => {
  dispatch({
    type: DELETE_CHAT_MESSAGE,
    payload: chatMessageId,
  });
};
