import { LOGIN_USER, UPDATE_CONNECTED_USERLIST } from '../types';
import axios from '../../config/axios';

const baseUrl = 'http://localhost:1337/api/v1/users';

export const login = (email, password, history) => dispatch => {
  console.log(history);
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
      history.push('/');
    })
    .catch(err => {
      console.log(err);
      console.log(err.response.data);
    });
};

export const updateConnectedUserList = userList => dispatch => {
  dispatch({ type: UPDATE_CONNECTED_USERLIST, payload: userList });
};
