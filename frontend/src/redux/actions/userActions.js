import { LOGIN_USER, GET_ALL_USERS, UPDATE_CONNECTED_USERLIST, SET_ERRORS } from '../types';
import axios from '../../config/axios';

const baseUrl = `${process.env.REACT_APP_API_URL}/api/v1/users`;

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
      dispatch({ type: SET_ERRORS, payload: err.response.data.message });
    });
};

export const logout = async () => {
  if (window.confirm('Weet u zeker dat u wilt uitloggen?')) {
    try {
      const res = await axios.get(`${baseUrl}/logout`);

      if ((res.data.status = 'success'))
        window.location.replace(`${process.env.REACT_APP_FRONTEND_URL}/login`);
    } catch (err) {
      alert('Error logging out!, please try again.');
    }
  }
};

export const getAllUsers = () => dispatch => {
  return axios
    .get(`${baseUrl}`)
    .then(res => {
      console.log('getAllUsers');
      dispatch({ type: GET_ALL_USERS, payload: res.data.docs });
    })
    .catch(err => console.log(err));
};

export const updateConnectedUserList = userList => dispatch => {
  dispatch({ type: UPDATE_CONNECTED_USERLIST, payload: userList });
};
