import {
  GET_ALL_CHAT_MESSAGES,
  CREATE_CHAT_MESSAGE,
  SET_LAST_CHAT_MESSAGE,
  DELETE_CHAT_MESSAGE,
  SET_ACTIVE_CHATROOM,
  SET_USER_CHATROOMS,
  CREATE_CHAT_ROOM,
} from '../types';

const initialState = {
  chatMessages: [],
  chatRooms: [],
  lastMessages: [],
  activeChatRoom: [],
  // loading: true,
};
export default function chatMessageReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_CHAT_MESSAGES:
      return {
        ...state,
        chatMessages: action.payload,
      };

    case CREATE_CHAT_MESSAGE:
      // room.chatMessages[0]?.body

      // TODO: CODE HIERONDER RENDERT DE STATE NIET
      // MISSCHIEN DOOR DE LASTMESSAGES MAPPEN, EN WAAR ACTION.PAYLOAD._ID HETZELFDE IS AL LASTMESSAGE ID VERVANGEN
      // let newLastMessages = [...state.lastMessages];

      // newLastMessages.map((message, i) => {
      //   if (message.chatRoomId === action.payload.chatRoomId) {
      //     return (newLastMessages[i] = { ...action.payload });
      //   }
      // });
      // console.log(newLastMessages);

      // console.log(lastMessage);
      // state.chatRooms.map(room => {
      //   if (room._id === action.payload.chatRoomId) {
      //     console.log(room);
      //     return (room.chatMessages[0].body = action.payload.body);
      //   }
      // });

      return {
        ...state,
        // lastMessages: newLastMessages,
        chatMessages:
          state.chatMessages.length > 10
            ? [...state.chatMessages, action.payload].slice(1) // keep the max size of chatMessages at 10
            : [...state.chatMessages, action.payload],
      };

    case SET_LAST_CHAT_MESSAGE: {
      // only return lastMessages where the message is not undefined
      let newLastMessages = [...state.lastMessages].filter(message => message && message);
      // console.log(newLastMessages);

      // Resort the friendslist on last created message
      newLastMessages.map((message, i) => {
        if (message.chatRoomId === action.payload.chatRoomId) {
          return (newLastMessages[i] = { ...action.payload });
        }
      });

      return {
        ...state,
        lastMessages: newLastMessages,
      };
    }
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
    case SET_USER_CHATROOMS: // Only chatRooms that have messages are rendered
      let lastMessages = action.payload.map(room => room.chatMessages[0]);
      // console.log(action.payload);

      let sortedChatRooms = [...action.payload];

      // only return the chatrooms where there are chatmessages
      // sortedChatRooms = sortedChatRooms.filter(room => room.chatMessages.length > 0 && room);

      console.log(sortedChatRooms);

      sortedChatRooms.sort((a, b) => {
        if (a.chatMessages[0] && b.chatMessages[0]) {
          return new Date(b.chatMessages[0].createdAt) - new Date(a.chatMessages[0].createdAt);
        }
        return;
      });

      return {
        ...state,
        // loading: false,
        lastMessages: lastMessages,
        // chatRooms: action.payload,
        chatRooms: sortedChatRooms, // initial sort on page load/refresh. rerender sorting happens in SET_LAST_CHAT_MESSAGE
      };
    case SET_ACTIVE_CHATROOM:
      console.log(action.payload);

      return {
        ...state,
        activeChatRoom: action.payload,
        chatMessages: action.payload.chatMessages.reverse(),
      };
    case CREATE_CHAT_ROOM: {
      const newChatRooms = [...state.chatRooms];
      console.log(newChatRooms);
      console.log(action.payload);

      return {
        ...state,
        chatRooms: [...newChatRooms, action.payload],
      };
    }
    default:
      return state;
  }
}
