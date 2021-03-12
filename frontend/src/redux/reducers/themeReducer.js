import { SET_LIGHT_THEME, SET_DARK_THEME } from '../types';

const initialState = {
  theme: 'dark',
};

export default function socketReducer(state = initialState, action) {
  switch (action.type) {
    case SET_LIGHT_THEME:
      return {
        ...state,
        theme: 'light',
      };
    case SET_DARK_THEME:
      return {
        ...state,
        theme: 'dark',
      };

    default:
      return state;
  }
}
