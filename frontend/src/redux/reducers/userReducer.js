import {
  SET_ERRORS,
  CLEAR_ERRORS,
  SET_SUCCESS,
  CLEAR_SUCCESS,
  LOGIN_USER,
  SET_CURRENT_USER,
  GET_ALL_USERS,
  UPDATE_CONNECTED_USERLIST,
  UPDATE_AVATAR,
  UPDATE_USERS_WITH_SOCKETS,
} from '../types';

const initialState = {
  connectedUsers: {},
  usersWithSockets: [],
  users: [],
  user: {},
  loading: true,
  errors: [],
  success: '',
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
      let allUsers = [...action.payload];

      let sortedAllUsers = allUsers.sort(function (a, b) {
        var textA = a.username.toUpperCase();
        var textB = b.username.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      return {
        ...state,
        users: sortedAllUsers,
      };
    case UPDATE_CONNECTED_USERLIST:
      // userlist from backend
      const onlineUsers = { ...action.payload };
      console.log(onlineUsers);

      const sortedByOnlineUsers = [...state.users];

      // Display online users on top in the contacts friendlist
      sortedByOnlineUsers.forEach(user => {
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

      // Sorting contacts in the friendlist: Online users on top, then alphabetically. no good yet...
      sortedByOnlineUsers.sort((a, b) => {
        if (b.online > a.online) {
          return 1;
        }
        if (a.username.toLowerCase() < b.username.toLowerCase()) {
          return -1;
        }
        if (a.username.toLowerCase() > b.username.toLowerCase()) {
          return 0;
        }
        return 0;
      });

      console.log(sortedByOnlineUsers);

      return {
        ...state,
        users: sortedByOnlineUsers,
        connectedUsers: action.payload,
      };
    case UPDATE_USERS_WITH_SOCKETS: {
      return {
        ...state,
        usersWithSockets: [...action.payload],
      };
    }
    case UPDATE_AVATAR:
      console.log(action.payload);
      return {
        ...state,
        user: action.payload,
      };
    case SET_ERRORS:
      return {
        ...state,
        loading: false,
        errors: [...state.errors, action.payload],
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        loading: false,
        errors: [],
      };
    case SET_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action.payload,
      };
    case CLEAR_SUCCESS:
      return {
        ...state,
        loading: false,
        success: '',
      };

    default:
      return state;
  }
}
