import { useEffect, useState, useRef } from 'react';

// Redux
import { connect } from 'react-redux';

// Redux Actions
import {
  createChatMessage,
  deleteChatMessage,
  emitCreateChatMessageFromServerToAllClients,
  emitDeleteChatMessageFromServerToAllClients,
  getSingleChatRoom,
} from '../redux/actions/chatMessageActions';

// Receive from server types:
import { OUTPUT_CHAT_MESSAGE, DELETED_CHAT_MESSAGE } from '../redux/types';

import moment from 'moment';

// Components
import ChatFriendsList from './ChatFriendsList';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import noImg from '../images/no-img.png';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: '100%',
    height: '80vh',
  },
  headBG: {
    backgroundColor: '#e0e0e0',
  },
  borderRight500: {
    borderRight: '1px solid #e0e0e0',
  },
  messageArea: {
    height: '70vh',
    overflowY: 'auto',
  },
});

const BigChat = props => {
  const classes = useStyles();

  // Local State
  const [chatMessage, setChatMessage] = useState('');

  const {
    socket,
    emitCreateChatMessageFromServerToAllClients,
    emitDeleteChatMessageFromServerToAllClients,
  } = props;

  //   On changes to the chatMessages in the state
  useEffect(() => {
    // Listen to incoming chatMessages from the backend
    // console.log(socket._callbacks);

    if (socket._callbacks['$OUTPUT_CHAT_MESSAGE']) {
      socket._callbacks['$OUTPUT_CHAT_MESSAGE'].length = 0;
    }

    socket.on(OUTPUT_CHAT_MESSAGE, messageFromBackend => {
      // Dispatch messageFromBackend to the chatMessageReducer, to update the state/props to rerender
      // props.createChatMessage(messageFromBackend);
      console.log('message from backend:');
      console.log(messageFromBackend);

      console.log(props);

      emitCreateChatMessageFromServerToAllClients(messageFromBackend);

      // Dispatch from here, so that the redux state is updated for all clients.
    });

    // Listen to incoming ID's from deleted chatMessages from the backend / db
    socket.on(DELETED_CHAT_MESSAGE, messageIdFromBackEnd => {
      emitDeleteChatMessageFromServerToAllClients(messageIdFromBackEnd);
    });
  }, [
    props.activeChatRoom,
    socket,
    emitCreateChatMessageFromServerToAllClients,
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
    <div>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant='h5' className='header-message'>
            DNK
          </Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={3} className={classes.borderRight500}>
          <List>
            <ListItem button key='RemySharp'>
              <ListItemIcon>
                <Avatar alt='Remy Sharp' src={noImg} />
              </ListItemIcon>
              <ListItemText primary={props.user.username}></ListItemText>
            </ListItem>
          </List>
          <Divider />
          <Grid item xs={12} style={{ padding: '10px' }}>
            <TextField id='outlined-basic-email' label='Search' variant='outlined' fullWidth />
          </Grid>
          <Divider />

          {/* Friend list */}
          <List>
            {props.chatRooms ? (
              props.chatRooms.map(room => {
                return room.members.map(member => {
                  if (member.username !== props.user.username) {
                    return (
                      <ListItem
                        button
                        key={room._id}
                        onClick={e => {
                          console.log('click');
                          console.log(`Room Id: ${room._id}`);
                          props.getSingleChatRoom(room._id);
                          props.socket.emit('roomId', room._id);
                        }}>
                        <ListItemIcon>
                          <Avatar
                            alt={member.username}
                            src='https://material-ui.com/static/images/avatar/1.jpg'
                          />
                        </ListItemIcon>
                        <ListItemText primary={member.username}>{member.username}</ListItemText>
                        <ListItemText secondary='online' align='right'></ListItemText>
                      </ListItem>
                    );
                  }
                });
              })
            ) : (
              <div>no rooms</div>
            )}
          </List>

          {/*  */}
        </Grid>
        <Grid item xs={9}>
          {/* Chat Message Area */}
          <List className={props.messageArea}>
            {props.activeChatRoom.chatMessages ? (
              props.chatMessages.map(message => (
                <ListItem key={message._id}>
                  <Grid container>
                    <Grid item xs={12}></Grid>
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

          <Divider />
          <Grid container style={{ padding: '20px' }}>
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
            <Grid align='right'>
              <Fab color='primary' aria-label='add'>
                <SendIcon />
              </Fab>
            </Grid>
          </Grid>

          {/*  */}
        </Grid>
      </Grid>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
    chatMessages: state.chat.chatMessages,
    chatRooms: state.chat.chatRooms,
    user: state.user.user,
    activeChatRoom: state.chat.activeChatRoom,
  };
};

export default connect(mapStateToProps, {
  createChatMessage,
  deleteChatMessage,
  getSingleChatRoom,
  emitCreateChatMessageFromServerToAllClients,
  emitDeleteChatMessageFromServerToAllClients,
})(BigChat);
