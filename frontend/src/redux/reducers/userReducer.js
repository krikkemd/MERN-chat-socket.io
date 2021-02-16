import { LOGIN_USER } from '../types';

const initialState = {
  users: [],
  user: {},
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGIN_USER:
      return {
        ...state,
        user: action.payload.token,
      };

    default:
      return state;
  }
}
