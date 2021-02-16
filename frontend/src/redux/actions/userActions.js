import { LOGIN_USER, SIGNUP_USER } from '../types';
import axios from '../../config/axios';

const baseUrl = 'http://localhost:1337/api/v1/users';

// TODO: WHERE IS MY FOOKING COOKIE
// SEND BACK USERNAME AND ID WITH TOKEN FROM SERVER?

export const login = (email, password) => dispatch => {
  return axios
    .post(
      `${baseUrl}/login`,
      { email, password },
      // { withCredentials: true, credentials: 'include' },
    )
    .then(res => {
      console.log(res);
      dispatch({
        type: LOGIN_USER,
        payload: res.data,
      });
    })
    .catch(err => {
      console.log(err);
      console.log(err.response.data);
    });
};
