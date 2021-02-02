// Get all Screams
import axios from '../../axios';

const server = 'http://localhost:1337/api/v1';

// export const getScreams = () => dispatch => {
//   dispatch({ type: LOADING_DATA });
//   axios
//     .get('/screams')
//     .then(res => {
//       dispatch({
//         type: SET_SCREAMS,
//         payload: res.data,
//       });
//     })
//     .catch(err => {
//       dispatch({
//         type: SET_SCREAMS,
//         payload: [],
//       });
//     });
// };

// Get All Chat Messages
export const getAllChatMessages = () => {
  return axios
    .get(`${server}/chatMessages`)
    .then(res => {
      // dispatch
      return res;
    })
    .catch(err => {
      console.log(err);
      // dispatch SET_ERROR
    });
};

// Create Single Chat Message
export const createChatMessage = chatMessage => {
  return axios
    .post(`${server}/chatMessages`, chatMessage)
    .then(res => {
      // dispatch
      return res;
    })
    .catch(err => {
      console.log(err);
      // dispatch SET_ERROR
    });
};

// Delete Single Chat Message
export const deleteChatMessage = chatMessageId => {
  return axios
    .delete(`${server}/chatMessages/${chatMessageId}`)
    .then(res => {
      console.log('deleted successfully');
      console.log(res);
      return res;
    })
    .catch(err => {
      console.log(err);
    });
};
