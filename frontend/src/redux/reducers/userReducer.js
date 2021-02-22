import { SET_ERRORS, LOGIN_USER, SET_CURRENT_USER, UPDATE_CONNECTED_USERLIST } from '../types';

const initialState = {
  connectedUsers: {},
  user: {},
  loading: true,
  errors: [],
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_USER:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
      };
    case SET_CURRENT_USER:
      return {
        ...state,
        loading: false,
        user: action.payload.currentUser,
      };
    case UPDATE_CONNECTED_USERLIST:
      return {
        ...state,
        connectedUsers: action.payload,
      };
    case SET_ERRORS:
      return {
        ...state,
        loading: false,
        errors: action.payload,
      };

    default:
      return state;
  }
}
