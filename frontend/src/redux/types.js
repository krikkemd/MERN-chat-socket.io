// CHATMESSAGE TYPES
// Send to server / backend types:
export const GET_ALL_CHAT_MESSAGES = 'GET_ALL_CHAT_MESSAGES';
export const CREATE_CHAT_MESSAGE = 'CREATE_CHAT_MESSAGE';
export const SET_LAST_CHAT_MESSAGE = 'SET_LAST_CHAT_MESSAGE';
export const DELETE_CHAT_MESSAGE = 'DELETE_CHAT_MESSAGE';

// Receive from server / backed types:
export const OUTPUT_CHAT_MESSAGE = 'OUTPUT_CHAT_MESSAGE';
export const DELETED_CHAT_MESSAGE = 'DELETED_CHAT_MESSAGE';

// USER TYPES - client side
export const SIGNUP_USER = 'SIGNUP_USER';
export const LOGIN_USER = 'LOGIN_USER';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';

// USER TYPES - sent to backend
export const USER_CONNECTED = 'USER_CONNECTED';
export const USER_DISCONNECTED = 'USER_DISCONNECTED';

// Update the connected userlist in the redux state. (Authroute)
export const UPDATE_CONNECTED_USERLIST = 'UPDATE_CONNECTED_USERLIST';
export const GET_ALL_USERS = 'GET_ALL_USERS';

// CHAT ROOM TYPES
export const SET_ACTIVE_CHATROOM = 'SET_ACTIVE_CHATROOM';
export const SET_USER_CHATROOMS = 'SET_USER_CHATROOMS';

// ERROR TYPES
export const SET_ERRORS = 'SET_ERRORS';
