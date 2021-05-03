import {
  GET_ALL_CHAT_MESSAGES,
  CREATE_CHAT_MESSAGE,
  DELETE_CHAT_MESSAGE,
  SET_ACTIVE_CHATROOM,
  SET_USER_CHATROOMS,
  SET_LAST_CHAT_MESSAGE,
  CREATED_CHAT_ROOM,
  SET_ERRORS,
  LEAVE_CHATROOM,
  ADD_USERS_TO_CHATROOM,
  SET_NO_ACTIVE_CHATROOM,
} from '../types';
import axios from '../../config/axios';

const baseUrl = 'http://localhost:1337/api/v1/chatMessages';

// REDUX
export const getAllChatMessages = (chatRoomId, skip) => dispatch => {
  // dispatch({ type: LOADING_DATA });
  if (!chatRoomId) return console.error('GEEN CHATROOMID');

  axios
    .get(`${baseUrl}?skip=${skip}&chatRoomId=${chatRoomId}`)
    .then(res => {
      console.log(res);
      if (res.data.chatMessages.length > 0) {
        dispatch({
          type: GET_ALL_CHAT_MESSAGES,
          payload: res.data.chatMessages,
        });
      }
    })
    .catch(err => {
      console.log(err);
      // dispatch({
      //   type: SET_ERRORS,
      //   payload: err.response.data,
      // });
    });
};

// Get single chatRoom which include a virtual populate of the chatMessages
export const getSingleChatRoom = roomId => dispatch => {
  axios
    .get(`http://localhost:1337/api/v1/rooms/${roomId}`)
    .then(res => {
      console.log(res.data.doc.chatMessages);
      dispatch({ type: SET_ACTIVE_CHATROOM, payload: res.data.doc });
    })
    .catch(err => {
      console.log(err);
    });
};

// GetAllRooms({members: "req.user._id"}) // gets all the chatrooms where the currentUser is a member
export const getAllUserChatRooms = queryString => dispatch => {
  console.log('running getAllUserChatRooms');

  console.log(queryString);

  return axios
    .get(`http://localhost:1337/api/v1/rooms?${queryString}`)
    .then(res => {
      console.log(res.data);

      if (!queryString.includes('[all]')) {
        console.log('query does not include [all], dispatch SET_USER_CHATROOMS');
        dispatch({ type: SET_USER_CHATROOMS, payload: res.data.chatRooms });
      }
      return res.data;
    })
    .catch(err => console.log(err));
};

export const createChatRoom = (socket, name, moderator, ...members) => dispatch => {
  console.log(socket);
  let newChatRoom = {
    moderator: moderator,
    members: members,
  };

  console.log(newChatRoom);
  console.log(members);
  console.log(...members);

  if (newChatRoom.members.length === 2) {
    console.log('createChatRoom with 2 members');
    axios
      .post(`http://localhost:1337/api/v1/rooms`, newChatRoom)
      .then(res => {
        console.log(res.data);

        if (res.data) {
          socket.emit(CREATED_CHAT_ROOM, res.data.doc);
          dispatch({ type: SET_ACTIVE_CHATROOM, payload: res.data.doc });
        }
      })
      .catch(err => console.log(err));
  } else {
    console.log('create chatRoom with > 2 members');

    if (name.length < 1) {
      console.log('Groepsnaam is te kort');
      return dispatch({
        type: SET_ERRORS,
        payload: 'Groepsnaam is te kort',
      });
    } else if (name.length > 25) {
      console.log('Groepsnaam is te lang, gebruik maximaal 20 tekens.');
      return dispatch({
        type: SET_ERRORS,
        payload: 'Groepsnaam is te lang, gebruik maximaal 20 tekens.',
      });
    }

    // members: ['60599e90e50ae834b8a4db37', '6059a170e50ae834b8a4db4c'];
    console.log(Object.values(...members));
    newChatRoom = {
      name: name,
      moderator: moderator,
      members: Object.values(...members),
    };

    console.log(newChatRoom);

    axios
      .post(`http://localhost:1337/api/v1/rooms`, newChatRoom)
      .then(res => {
        console.log(res.data);
        createSystemMessage(res.data.doc._id, `Welkom in de chatgroep: '${newChatRoom.name}'`);

        socket.emit(CREATED_CHAT_ROOM, res.data.doc);

        dispatch({ type: SET_ACTIVE_CHATROOM, payload: res.data.doc });
      })
      .catch(err => {
        console.log(err.response.data);
        return dispatch({ type: SET_ERRORS, payload: err.response.data.message });
      });
  }
};

export const leaveChatRoom = (socket, roomId, user) => dispatch => {
  console.log('running leaveChatRoom');
  axios
    .patch(`/api/v1/rooms/${roomId}/leaveChatRoom`)
    .then(res => {
      console.log(res.data);
      dispatch({ type: SET_NO_ACTIVE_CHATROOM });
      dispatch({ type: LEAVE_CHATROOM, payload: res.data });
      socket.emit(LEAVE_CHATROOM, roomId, user, res.data);

      createSystemMessage(roomId, `${user.username} heeft de groep verlaten.`);
    })
    .catch(err => {
      console.log(err.response);
      console.log(err.message);
      dispatch({ type: SET_NO_ACTIVE_CHATROOM });
      dispatch({ type: LEAVE_CHATROOM, payload: { data: { _id: roomId } } });
    });
};

// Update we use for adding new users to the chatroom from the joinChatRoomModal
// TODO: EMIT UPDATE STATE FOR ALL USERS IN THE ROOM, TO SHOW THAT THE ACTIVECHATROOM, AND THE FRIENDSLIST REFLECTS THE ADDED USER
// ERROR HANDLING ON TOO MANY OR NOT ENOUGH USERS ETC. IF THE USER IS ALREADY PRESENT
export const updateChatRoom = (socket, roomId, socketIds, ...members) => dispatch => {
  console.log('running update chatroom');
  let chatRoom = {
    members: Object.values(...members),
  };

  console.log(chatRoom);
  axios
    .patch(`/api/v1/rooms/${roomId}`, chatRoom)
    .then(res => {
      console.log(res.data);

      // send the new room and socket ids to the server
      socket.emit(ADD_USERS_TO_CHATROOM, res.data, socketIds);

      // Array of the newly added members
      let welcomeUsers = res.data.data.members.slice(
        res.data.data.members.length - socketIds.length,
      );

      console.log(welcomeUsers);

      // Welcome the new members to the room with a message, also updating the state for the new users
      // Split / join for the commas
      createSystemMessage(
        roomId,
        `${welcomeUsers.map(user => user && `${user.username}, `)} Welkom in de chat!`,
      );
    })
    .catch(err => console.log(err));
};

// Create Single Chat Message SEND ALONG COOKIE PROTECT ROUTE
export const createChatMessage = chatMessage => dispatch => {
  console.log(chatMessage);
  // dispatch({ type: LOADING_DATA });

  axios
    .post(`${baseUrl}`, chatMessage)
    .then(res => {
      console.log(res);
      // dispatch({
      //   type: CREATE_CHAT_MESSAGE,
      //   payload: res.data.chatMessage,
      // });
    })
    .catch(err => {
      console.log(err.response);
      // Redirect to log in page when not logged in
      window.location.replace('/login');
    });
};

export const createSystemMessage = (roomId, message) => {
  console.log('running create system message');
  axios
    .post(`${baseUrl}/createSystemMessage`, { chatRoomId: roomId, body: message })
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
};

// MemberId is the OTHER member in the room, not you. only set messages to read you've received
export const markMessagesRead = (roomId, memberId) => dispatch => {
  axios
    .patch(baseUrl, { chatRoomId: roomId, memberId: memberId })
    .then(res => {
      console.log(res);
    })
    .catch(err => console.log(err));
};

// Takes in the message from backend after change in db. emit to all connected clients.
export const emitCreateChatMessageFromServerToAllClients = messageFromBackend => dispatch => {
  dispatch({
    type: CREATE_CHAT_MESSAGE,
    payload: messageFromBackend,
  });
};

// Takes in the message from backend after change in db. to update the state for all connected clients, not just your own state.
export const emitLastChatMessage = messageFromBackend => dispatch => {
  dispatch({
    type: SET_LAST_CHAT_MESSAGE,
    payload: messageFromBackend,
  });
};

// Delete Single Chat Message REDUX
export const deleteChatMessage = chatMessageId => dispatch => {
  axios
    .delete(`${baseUrl}/${chatMessageId}`)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
};

// Takes in the message from backend after change in db. emit to all connected clients.
export const emitDeleteChatMessageFromServerToAllClients = messageFromBackend => dispatch => {
  dispatch({
    type: DELETE_CHAT_MESSAGE,
    payload: messageFromBackend,
  });
};
