import { SET_ERRORS, CLEAR_ERRORS, SET_CURRENT_USER } from '../types';
import axios from '../../config/axios';

const baseUrl = 'http://localhost:1337/api/v1/getCurrentLoggedInUser';

// REDUX
export const getCurrentLoggedInUser = () => dispatch => {
  console.log('running getCurrentLoggedInUser');
  axios
    .get(`${baseUrl}`)
    .then(res => {
      console.log(res.data);

      // Dispatch to userReducer
      dispatch({
        type: SET_CURRENT_USER,
        payload: res.data,
      });

      dispatch({
        type: CLEAR_ERRORS,
      });
    })
    // no current user
    .catch(err => {
      console.log(err.response.data);
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data.message,
      });
    });
};
