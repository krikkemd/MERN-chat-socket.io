import {
  SET_ERRORS,
  LOGIN_USER,
  SET_CURRENT_USER,
  GET_ALL_USERS,
  UPDATE_CONNECTED_USERLIST,
} from '../types';

const initialState = {
  connectedUsers: {},
  users: [],
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
    case GET_ALL_USERS:
      return {
        ...state,
        users: action.payload,
      };
    case UPDATE_CONNECTED_USERLIST:
      const onlineUsers = { ...action.payload };

      const sortedByOnlineUsers = [...state.users];

      // Display online users on top in the contacts friendlist
      sortedByOnlineUsers.map(user => {
        if (Object.values(onlineUsers).includes(user._id)) {
          console.log(user);
          user.online = true;
        } else {
          user.online = false;
        }

        sortedByOnlineUsers.sort((a, b) => {
          return b.online - a.online;
        });
      });

      return {
        ...state,
        users: sortedByOnlineUsers,
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
