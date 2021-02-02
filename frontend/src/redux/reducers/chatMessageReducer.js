import { GET_ALL_CHAT_MESSAGES, CREATE_CHAT_MESSAGE, DELETE_CHAT_MESSAGE } from '../types';

const initialState = {
  //   payload: {},
  chatMessages: [],
  chatMessage: {},
  loading: false,
};
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_ALL_CHAT_MESSAGES:
      //   console.log(action.payload);
      return {
        ...state,
        chatMessages: action.payload,
      };

    case CREATE_CHAT_MESSAGE:
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };
    case DELETE_CHAT_MESSAGE: {
      // console.log('reducer', action.payload); // payload here ==- screamId
      // let filteredScreams = state.screams.filter(scream => scream.screamId !== action.payload);
      // return {
      //   ...state,
      //   screams: filteredScreams,
      // };

      // findIndex stops when the index is found, filter does not. findindex should be faster here

      let index = state.chatMessages.findIndex(message => message._id === action.payload);
      let filteredChatMessages = [...state.chatMessages];
      filteredChatMessages.splice(index, 1);

      console.log(filteredChatMessages);
      console.log(state);
      return {
        ...state,
        chatMessages: filteredChatMessages,
      };
    }
    default:
      return state;
  }
}
