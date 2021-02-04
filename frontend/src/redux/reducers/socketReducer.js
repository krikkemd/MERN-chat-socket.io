import io from 'socket.io-client';
let server = 'http://localhost:1337';
const socket = io(server);

const initialState = {
  socket: socket,
};
export default function (state = initialState, action) {
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
