// React
import { useEffect, useState, useRef } from 'react';

// Redux
import { connect, useDispatch } from 'react-redux';

// Redux Actions
import {
  createChatMessage,
  deleteChatMessage,
  emitCreateChatMessageFromServerToAllClients,
  emitLastChatMessage,
  emitDeleteChatMessageFromServerToAllClients,
  getAllUserChatRooms,
} from '../redux/actions/chatMessageActions';

import {
  OUTPUT_CHAT_MESSAGE,
  DELETED_CHAT_MESSAGE,
  CREATE_CHAT_ROOM,
  EMIT_CREATED_CHAT_ROOM,
  MEMBERS_JOIN_NEW_CHAT_ROOM,
  TOGGLE_CHAT,
} from '../redux/types';

import moment from 'moment';

// MUI
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';

import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import noImg from '../images/no-img.png';

const ChatMessageArea = props => {
  // Local State
  const [chatMessage, setChatMessage] = useState('');

  const dispatch = useDispatch();

  const {
    user,
    socket,
    activeChatRoom,
    emitCreateChatMessageFromServerToAllClients,
    emitLastChatMessage,
    emitDeleteChatMessageFromServerToAllClients,
    getAllUserChatRooms,
  } = props;

  //   On changes to the chatMessages in the state
  useEffect(() => {
    // Dont stack multiple callbacks, just execute once

    // if (socket._callbacks !== undefined && socket._callbacks['$OUTPUT_CHAT_MESSAGE']) {
    //   socket._callbacks['$OUTPUT_CHAT_MESSAGE'].length = 0;
    // }

    // if (socket._callbacks !== undefined && socket._callbacks['$EMIT_CREATED_CHAT_ROOM']) {
    //   socket._callbacks['$EMIT_CREATED_CHAT_ROOM'].length = 0;
    // }

    // if (socket._callbacks !== undefined && socket._callbacks['$DELETED_CHAT_MESSAGE']) {
    //   socket._callbacks['$DELETED_CHAT_MESSAGE'].length = 0;
    // }

    if (socket._callbacks !== undefined) {
      Object.keys(socket._callbacks).map(callback => {
        if (socket._callbacks[callback]) {
          socket._callbacks[callback].length = 0;
        }
      });
    }

    // Listen to incoming chatMessages from the backend
    socket.on(OUTPUT_CHAT_MESSAGE, messageFromBackend => {
      // Dispatch messageFromBackend to the chatMessageReducer, to update the state/props to rerender
      // props.createChatMessage(messageFromBackend);
      console.log('message from backend:');
      console.log(messageFromBackend);

      // updates the lastChatMessage at the friendsList for both the sender and the receiver of the message.
      emitLastChatMessage(messageFromBackend);

      // Reorder friendList to show latest conversation on top (SENDER)
      getAllUserChatRooms();

      if (user._id === messageFromBackend.userId) dispatch({ type: TOGGLE_CHAT });

      // Dispatch from here, so that the redux state is updated for all clients in the room.
      if (messageFromBackend.chatRoomId === props.activeChatRoom._id) {
        console.log('only runs when activeChatRoom === messageFromBackend.chatRoomId');
        emitCreateChatMessageFromServerToAllClients(messageFromBackend);
      }
    });

    // Listen to incoming ID's from deleted chatMessages from the backend / db
    socket.on(DELETED_CHAT_MESSAGE, messageIdFromBackEnd => {
      emitDeleteChatMessageFromServerToAllClients(messageIdFromBackEnd);
    });

    // When a new chatRoom is created, update the props.chatRooms for all members.
    socket.on(EMIT_CREATED_CHAT_ROOM, createdChatRoom => {
      console.log(createdChatRoom);

      // if the the current logged in user is a member of the new created chatroom, dispatch add the chatroom to the state. emit the chatroom to the server from all members, so they can all socket.join(theNewChatRoom) serverside
      createdChatRoom.members.map(member => {
        if (member._id === user._id) {
          console.log(member);
          dispatch({ type: CREATE_CHAT_ROOM, payload: createdChatRoom });
          socket.emit(MEMBERS_JOIN_NEW_CHAT_ROOM, createdChatRoom);
        }
      });
    });
  }, [
    socket,
    activeChatRoom,
    emitCreateChatMessageFromServerToAllClients,
    emitLastChatMessage,
    emitDeleteChatMessageFromServerToAllClients,
  ]);

  // Scroll to bottom on new chatMessage
  const chatEnd = useRef(null);
  useEffect(() => {
    chatEnd.current.scrollIntoView({ behavior: 'smooth' });
  });

  //   Local funcions
  const handleChange = e => {
    setChatMessage(e.target.value);
  };

  const submitChatMessage = e => {
    e.preventDefault();

    // Create chat message action
    props.createChatMessage({
      chatRoomId: props.activeChatRoom._id,
      body: chatMessage,
    });

    setChatMessage('');
  };

  return (
    <>
      <List>
        {props.activeChatRoom.chatMessages ? (
          props.chatMessages.map(message => (
            <ListItem key={message._id}>
              <Grid container>
                <Grid item xs={12}>
                  {/* username */}
                  <ListItemText
                    align={props.user._id === message.userId ? 'right' : 'left'}
                    secondary={message.username}></ListItemText>

                  {/* chat message body */}
                  <ListItemText align={props.user._id === message.userId ? 'right' : 'left'}>
                    <Chip
                      avatar={<Avatar alt={props.user.username} src={noImg} />}
                      label={message.body}
                      align={props.user._id === message.userId ? 'right' : 'left'}
                      color='primary'
                    />
                  </ListItemText>
                </Grid>

                {/* timestamp */}
                <Grid item xs={12}>
                  <ListItemText
                    align={props.user._id === message.userId ? 'right' : 'left'}
                    secondary={moment(message.createdAt).fromNow()}></ListItemText>
                </Grid>
              </Grid>
            </ListItem>
          ))
        ) : (
          <div>No Messages yet</div>
        )}

        <div ref={chatEnd} />
      </List>

      {/* <Grid
        container
        wrap='nowrap'
        style={{
          padding: '20px',
          paddingTop: '40px',
          marginBottom: '40px',
          borderTop: '1px solid #eee',
        }}>
        <Grid item xs={11}>
          <form onSubmit={submitChatMessage}>
            <TextField
              id='outlined-basic-email'
              label='Type Something'
              fullWidth
              autoFocus={true}
              value={chatMessage}
              onChange={handleChange}
            />
          </form>
        </Grid>
        <Grid item xs align='right'>
          <Fab color='primary' aria-label='add'>
            <SendIcon />
          </Fab>
        </Grid>
      </Grid> */}
    </>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
    chatMessages: state.chat.chatMessages,
    user: state.user.user,
    activeChatRoom: state.chat.activeChatRoom,
  };
};

export default connect(mapStateToProps, {
  createChatMessage,
  deleteChatMessage,
  emitCreateChatMessageFromServerToAllClients,
  emitLastChatMessage,
  emitDeleteChatMessageFromServerToAllClients,
  getAllUserChatRooms,
})(ChatMessageArea);
