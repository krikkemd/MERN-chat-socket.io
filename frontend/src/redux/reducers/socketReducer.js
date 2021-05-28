import io from 'socket.io-client';
let server = `${process.env.REACT_APP_API_URL}`;
const socket = io(server);

const initialState = {
  socket: socket,
};

export default function socketReducer(state = initialState, action) {
  switch (action.type) {
    case 'EMIT_CHAT_MESSAGE':
      //   console.log(action.payload);
      return {
        ...state,
      };

    default:
      return state;
  }
}
