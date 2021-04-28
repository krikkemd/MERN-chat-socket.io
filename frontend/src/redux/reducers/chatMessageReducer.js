import {
  GET_ALL_CHAT_MESSAGES,
  CREATE_CHAT_MESSAGE,
  SET_LAST_CHAT_MESSAGE,
  DELETE_CHAT_MESSAGE,
  SET_ACTIVE_CHATROOM,
  SET_USER_CHATROOMS,
  CREATE_CHAT_ROOM,
  LEAVE_CHATROOM,
  LEFT_CHATROOM,
  TOGGLE_CHAT,
  TOGGLE_CONTACTS,
  SET_NO_ACTIVE_CHATROOM,
} from '../types';

const initialState = {
  chatMessages: [],
  chatRooms: [],
  lastMessages: [],
  activeChatRoom: [],
  toggleFriendList: 'contacts',
  // loading: true,
};
export default function chatMessageReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_CHAT_MESSAGES:
      return {
        ...state,
        chatMessages: [...action.payload.reverse(), ...state.chatMessages],
      };

    case CREATE_CHAT_MESSAGE:
      let chatMessages = [...state.chatMessages];
      console.log(state.chatMessages.length);
      // When a user has scrolled up to get older messages, shrink the array down to 10 again, so it scrolls into the created message
      if (chatMessages.length > 10) {
        chatMessages = chatMessages.slice(state.chatMessages.length - 10);
      }
      console.log(chatMessages);
      return {
        ...state,
        // lastMessages: newLastMessages,
        chatMessages:
          state.chatMessages.length > 9
            ? [...chatMessages, action.payload].slice(1) // keep the max size of chatMessages at 10
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
        return null;
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

      // only return the chatrooms where there are chatmessages if there are 2 room members, also return groupchats // not sure if this works correctly
      sortedChatRooms = sortedChatRooms.filter(room => {
        if (room.chatMessages.length > 0 && room.members.length >= 1) {
          return room;
        }
        return null;
      });

      sortedChatRooms.sort((a, b) => {
        if (a.chatMessages[0] && b.chatMessages[0]) {
          return new Date(b.chatMessages[0].createdAt) - new Date(a.chatMessages[0].createdAt);
        } else {
          console.log('NO CHATMESSAGES TO SORT');
          return null;
        }
      });

      console.log(state);
      console.log(sortedChatRooms);

      // Mark chatmessage as read if the user has the chatroom open (without having to click the chatroom )
      sortedChatRooms.map(room => {
        if (room._id === state.activeChatRoom._id) {
          console.log('mark messages read');
          room.chatMessages.map(message => {
            if (message.read === false) {
              // console.log(message);
              message.read = true;
            }
            return null;
          });
        }
        return null;
      });

      return {
        ...state,
        // loading: false,
        lastMessages: lastMessages,
        // chatRooms: action.payload,
        chatRooms: sortedChatRooms, // initial sort on page load/refresh. rerender sorting happens in SET_LAST_CHAT_MESSAGE
      };
    case SET_ACTIVE_CHATROOM:
      // console.log(action.payload);
      // console.log(state);

      // set chatroom message as read
      let rooms = state.chatRooms?.filter(room => {
        if (action.payload._id === room._id) {
          room.chatMessages?.filter(message => {
            if (message.read === false) {
              message.read = true;
            }
            return null;
          });
        }
        return null;
      });
      console.log(rooms);

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
    case LEAVE_CHATROOM: {
      const newChatRooms = [...state.chatRooms];
      console.log(newChatRooms);
      console.log(action.payload.data._id);
      let roomId = action.payload.data._id;

      const roomIndex = newChatRooms.findIndex(room => {
        console.log(room);
        return room.id === roomId;
      });

      console.log(roomIndex);

      newChatRooms.splice(roomIndex, 1);
      console.log(newChatRooms);

      return {
        ...state,
        chatRooms: newChatRooms,
      };
    }
    case LEFT_CHATROOM: {
      const newChatRooms = [...state.chatRooms];
      const newActiveChatRoom = { ...state.activeChatRoom };

      console.log(newActiveChatRoom);

      // console.log(action.payload);
      // console.log(newChatRooms);

      const { roomId, leftUserId } = action.payload;

      newChatRooms.map(room => {
        if (room._id === roomId) {
          console.log(room);
          const leftUserIndex = room.members.findIndex(member => member._id === leftUserId);
          room.members.splice(leftUserIndex, 1);

          // Check if there is an active chatroom
          if (Object.keys(newActiveChatRoom).length !== 0) {
            newActiveChatRoom.members.splice(leftUserIndex, 1);
          }
          console.log(room);
        }
      });
      // console.log(newChatRooms);
      return {
        ...state,
        chatRooms: newChatRooms,
        activeChatRoom: newActiveChatRoom,
      };
    }
    case SET_NO_ACTIVE_CHATROOM: {
      return {
        ...state,
        activeChatRoom: [],
      };
    }
    case TOGGLE_CHAT: {
      return {
        ...state,
        toggleFriendList: 'chats',
      };
    }
    case TOGGLE_CONTACTS: {
      return {
        ...state,
        toggleFriendList: 'contacts',
      };
    }
    default:
      return state;
  }
}
