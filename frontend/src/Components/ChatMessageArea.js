// React
import { useEffect, useRef } from 'react';

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
  getAllUnreadMessages,
  markMessagesRead,
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
import { makeStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(theme => {
  console.log(theme);
  return {
    messageBody: {
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      paddingTop: 7.5,
      paddingBottom: 7.5,
      paddingLeft: 20,
      paddingRight: 15,
      borderRadius: 100 / 5,
      boxShadow:
        '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%)',
      display: 'inline-flex',
    },
  };
});

const ChatMessageArea = props => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const {
    user,
    socket,
    activeChatRoom,
    emitCreateChatMessageFromServerToAllClients,
    emitLastChatMessage,
    emitDeleteChatMessageFromServerToAllClients,
    getAllUserChatRooms,
    deleteChatMessage,
    getAllUnreadMessages,
    markMessagesRead,
  } = props;

  //   On changes to the chatMessages in the state
  useEffect(() => {
    // Dont stack multiple callbacks, just execute once

    if (socket._callbacks !== undefined && socket._callbacks['$OUTPUT_CHAT_MESSAGE']) {
      socket._callbacks['$OUTPUT_CHAT_MESSAGE'].length = 0;
    }

    if (socket._callbacks !== undefined && socket._callbacks['$EMIT_CREATED_CHAT_ROOM']) {
      socket._callbacks['$EMIT_CREATED_CHAT_ROOM'].length = 0;
    }

    if (socket._callbacks !== undefined && socket._callbacks['$DELETED_CHAT_MESSAGE']) {
      socket._callbacks['$DELETED_CHAT_MESSAGE'].length = 0;
    }

    // if (socket._callbacks !== undefined) {
    //   Object.keys(socket._callbacks).map(callback => {
    //     if (socket._callbacks[callback]) {
    //       socket._callbacks[callback].length = 0;
    //     }
    //   });
    // }

    // Listen to incoming chatMessages from the backend
    socket.on(OUTPUT_CHAT_MESSAGE, messageFromBackend => {
      // Dispatch messageFromBackend to the chatMessageReducer, to update the state/props to rerender
      // props.createChatMessage(messageFromBackend);
      console.log('message from backend:');
      console.log(messageFromBackend);

      // updates the lastChatMessage at the friendsList for both the sender and the receiver of the message.
      emitLastChatMessage(messageFromBackend);

      // Reorder friendList to show latest conversation on top (SENDER)
      getAllUserChatRooms(`members=${user._id}`);
      // getAllUnreadMessages(user._id);

      // toggle chat for the message sender
      if (user._id === messageFromBackend.userId) dispatch({ type: TOGGLE_CHAT });

      // Dispatch from here, so that the redux state is updated for all clients in the room.
      if (messageFromBackend.chatRoomId === props.activeChatRoom._id) {
        console.log('only runs when activeChatRoom === messageFromBackend.chatRoomId');
        emitCreateChatMessageFromServerToAllClients(messageFromBackend);

        // Scroll to bottom on send and receive message when the activeChatRoom === room that message is send to
        // chatEnd.current.scrollIntoView({ behavior: 'smooth' });
        console.log(props.chatMessages.length);
        if (props.chatMessages.length >= 10) {
          setTimeout(() => {
            scrollIntoLastMessage.current.childNodes[9].scrollIntoView({
              behavior: 'smooth',
            });
          }, 250);
        } else if (props.chatMessages.length > 0) {
          scrollIntoLastMessage.current.childNodes[props.chatMessages.length - 1].scrollIntoView({
            behavior: 'smooth',
          });
        }

        // When the received message is in the activeChatRoom, mark the message as read
        let memberId = props.activeChatRoom.members.filter(member => member._id !== user._id);
        markMessagesRead(props.activeChatRoom._id);
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
      createdChatRoom.members.forEach(member => {
        if (member._id === user._id) {
          console.log(member);
          dispatch({ type: CREATE_CHAT_ROOM, payload: createdChatRoom });
          socket.emit(MEMBERS_JOIN_NEW_CHAT_ROOM, createdChatRoom);
        }
      });
    });
  }, [
    props.chatMessages.length,
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
  }, [activeChatRoom]);

  // Gewoon omhoog scrollen werkt perfect
  // Typen zonder omhoog te scrollen werkt perfect
  // Eerst scrollen dan typen, werkt
  // Eerst typen, dan scrollen, dan typen werkt

  const scrollIntoLastMessage = useRef(null);

  useEffect(() => {
    // childTen === pos 9, arrays 0 based
    let childTen = scrollIntoLastMessage.current.childNodes[9]?.innerText.split(/\r?\n/)[2];
    console.log(scrollIntoLastMessage.current.childNodes);
    // let childTen = scrollIntoLastMessage.current.childNodes[props.chatMessages.length - 1]?.innerText.split(/\r?\n/)[2];
    let lastMessage = props.chatMessages[props.chatMessages.length - 1]?.body;

    console.log(childTen);
    console.log(lastMessage);
    if (props.chatMessages.length > 10) {
      // if the chatMessages array length is divisible by exactly 10, scroll into the new 10th which is the top message
      if (scrollIntoLastMessage.current.childNodes[10] && props.chatMessages.length % 10 === 0) {
        scrollIntoLastMessage.current.childNodes[10].scrollIntoView();
        console.log('if');
        // if the chatMessages array length is not divisible by exactly 10, e.g. 26, substract the array length (20) of the 26, and scroll into the 6

        // Not divisible by 10 === end of messages
      } else if (
        scrollIntoLastMessage.current.childNodes[10] &&
        props.chatMessages.length % 10 !== 0
      ) {
        console.log('not divisible by 10');
        console.log(props.chatMessages.length);
        let scrollLength =
          props.chatMessages.length - Math.floor(props.chatMessages.length / 10) * 10;
        console.log(scrollLength);
        scrollIntoLastMessage.current.childNodes[scrollLength].scrollIntoView();
      } else {
        console.log('else');
        // chatEnd.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // let colors = [ 'salmon',   'blue',    'green',   'purple',   'pink',   'red',   'yellow',  'teal', 'purple', 'lime']
  // let colors = ['#ffa97a', '#6bcbef', '#7affa9', '#e752ab', '#ff7b7a', '#ff7b7a', '#ffec7a', '#54d4a6', '#c9a6ff', '#19e619'];
  let colors = [
    '#ffa97a',
    '#6bcbef',
    '#7affa9',
    '#e752ab',
    '#ff7b7a',
    '#ff7b7a',
    '#ffec7a',
    '#54d4a6',
    '#c9a6ff',
    '#19e619',
  ];

  // #d8dbd5
  let indexes = [];

  props.activeChatRoom?.members?.map((member, i) => {
    indexes.push(member.username);
  });

  // console.log(indexes);

  return (
    <>
      <List ref={scrollIntoLastMessage}>
        {props.activeChatRoom.chatMessages ? (
          props.chatMessages.map(message => {
            return (
              <ListItem key={message._id}>
                <Grid container>
                  <Grid item xs={12}>
                    {/* username */}
                    {/* <ListItemText
                      style={{
                        display: message.systemMessage === true && 'none',
                        color: colors[indexes.indexOf(message.username)],
                      }}
                      align={props.user._id === message.userId ? 'right' : 'left'}>
                      {message.username}
                    </ListItemText> */}

                    {/* chat message body */}
                    <ListItemText
                      className={message.systemMessage ? 'leftGroup' : ''}
                      align={props.user._id === message.userId ? 'right' : 'left'}>
                      <ListItemText
                        className={classes.messageBody}
                        align={props.user._id === message.userId ? 'right' : 'left'}
                        style={{
                          backgroundColor: props.user._id !== message.userId && '#7e7e7e',
                        }}>
                        <span
                          style={{
                            color: colors[indexes.indexOf(message.username)],
                          }}>{`${message.username}`}</span>

                        {props.user._id === message.userId && (
                          <ClearIcon
                            className='delete__icon'
                            onClick={() => {
                              console.log(message.body);

                              if (
                                window.confirm('Weet u zeker dat u het bericht wilt verwijderen?')
                              ) {
                                console.log(`dit bericht wordt verwijderd: ${message.body}`);
                                deleteChatMessage(message._id);
                                getAllUserChatRooms(`members=${user._id}`);
                              }
                            }}
                            style={{
                              marginLeft: 10,
                              justifyContent: 'center',
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                          />
                        )}

                        <br />
                        <span>{`${message.body}`}</span>

                        <br />
                        <span
                          className={message.systemMessage ? 'leftGroup-timestamp' : ''}
                          style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.75rem',
                            marginLeft: 'auto',
                          }}>
                          {moment(message.createdAt).fromNow()}
                        </span>
                      </ListItemText>
                    </ListItemText>
                  </Grid>

                  {/* timestamp */}
                  {/* <Grid item xs={12}>
                    <ListItemText
                      className={message.systemMessage ? 'leftGroup-timestamp' : ''}
                      align={props.user._id === message.userId ? 'right' : 'left'}
                      secondary={moment(message.createdAt).fromNow()}></ListItemText>
                  </Grid> */}
                </Grid>
              </ListItem>
            );
          })
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Selecteer een gesprek
          </div>
        )}

        <div className={'test'} ref={chatEnd} />
      </List>
    </>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
    chatMessages: state.chat.chatMessages,
    user: state.user.user,
    activeChatRoom: state.chat.activeChatRoom,
    theme: state.theme.theme,
  };
};

export default connect(mapStateToProps, {
  createChatMessage,
  deleteChatMessage,
  emitCreateChatMessageFromServerToAllClients,
  emitLastChatMessage,
  emitDeleteChatMessageFromServerToAllClients,
  getAllUserChatRooms,
  getAllUnreadMessages,
  markMessagesRead,
})(ChatMessageArea);
