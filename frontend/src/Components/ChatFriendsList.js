import { useEffect } from 'react';

// Redux
import { connect, useDispatch } from 'react-redux';

// Redux actions
import { getAllUsers } from '../redux/actions/userActions';
import {
  getSingleChatRoom,
  createChatRoom,
  markMessagesRead,
} from '../redux/actions/chatMessageActions';

// Types
import { TOGGLE_CHAT, TOGGLE_CONTACTS, SET_NO_ACTIVE_CHATROOM } from '../redux/types';

// Components
import { StyledBadge } from '../util/StyledBadge';

// Helper functions
import { firstCharUpperCase } from '../util/helperFunctions';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import MessageIcon from '@material-ui/icons/Message';
import Tooltip from '@material-ui/core/Tooltip';
import GroupChat from './GroupChat';
import CreateGroupModal from '../util/CreateGroupModal';

const useStyles = makeStyles(theme => ({
  chatButtons: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: theme.palette.background.paper,
    justify: 'space-between',
  },
}));

const ChatFriendsList = props => {
  // authroute calls getsAllUserRooms, which queries the chatrooms with {req.user._id} where the current logged in user is a member of.
  // We add the chatrooms to the redux state, only chatrooms that have messages are rendered to CHATS
  // we render the chatrooms, with the name of the member that is not the currentUser, sorted by the last created or received message on top.
  // onCLick => getChatMessages from that room with the room._id + we socket.join('clickedRoom') server side, and leave all other rooms. (SERVER SIDE: NO LONGER TRUE)
  // in socketManager we query the chatRooms where the user is a member, we loop through the rooms and socket.join them all.

  const classes = useStyles();
  const dispatch = useDispatch();

  useEffect(() => {
    props.getAllUsers();
  }, []);

  const { toggleFriendList } = props;

  // check if there is a chatroom with the clicked on contact. create one if there is not.
  const checkIfContactHasChatRoom = clickedContact => {
    let chatroom;
    props.chatRooms.map(room => {
      room.members.map(member => {
        if (clickedContact._id === member._id && room.members.length <= 2) {
          chatroom = room;
        }
      });
    });
    console.log(chatroom);

    // If there is a chatroom, set it as the activeChatRoom
    if (chatroom) {
      props.getSingleChatRoom(chatroom._id);

      // If the chatroom contains chatMessages, render 'chats'. If the chatroom does not contain chatMessages, stay in 'contacts'.
      // chatroom.chatMessages.length > 0 && dispatch({ type: TOGGLE_CHAT });
      if (chatroom.chatMessages.length > 0) {
        dispatch({ type: TOGGLE_CHAT });
        let memberId = chatroom.members.filter(member => member._id !== props.user._id);
        props.markMessagesRead(chatroom._id, memberId);
      }
    } else {
      // There is no chatRoom, stay in 'contacts'
      dispatch({ type: TOGGLE_CONTACTS });
      console.log('no chatroom');

      // chatmessages: [] at chatroomModel?
      // If there is no chatroom found, create a new chatroom.
      // When the chatRoom is created, send it: socket.emit(CREATED_CHAT_MESSAGE, res.data.doc) to the server.
      // dispatch SET_ACTIVE_CHATROOM which updates the props.activeChatRoom of the current user to the newly created chatroom
      // the server socket.joins(newChatRoom._id) with the current socket.
      // Server emits EMIT_CREATED_CHATROOM to chatMessageArea
      // dispatch CREATE_CHAT_ROOM which updates the props.chatrooms of the chatRoomsMembers, updating the state. can't create 2 rooms ✅
      // socket.emit(MEMBERS_JOIN_CHAT_ROOMS, newCreatedChatRoomId) to the server, so all connected members join the new chat room.
      // TODO: Notification on unread messages
      // TODO: set an expiry time on the chatRoom if no messages are sent within one hour/day?
      // TODO: process nog een x doorlopen, misschien kan er wel een emit of dispatch tussen uit. bijvoorbeeld na onchange, als we toch emitten naar iedereen, en dan pas de members filteren.
      props.createChatRoom(props.socket, null, clickedContact._id, props.user._id);
    }
  };

  const countTotalUnreadMessages = props.chatRooms.map(room => {
    return room.chatMessages.filter(message => {
      return message.read === false && message.userId !== props.user._id;
    }).length;
  });

  let totalUnreadMessages;
  if (countTotalUnreadMessages[0]) {
    totalUnreadMessages = countTotalUnreadMessages.reduce((a, b) => a + b);
  }
  console.log(totalUnreadMessages);

  return (
    <List>
      <Grid container className={classes.chatButtons}>
        <Grid item xs={4} style={{ borderRight: '1px solid lightgrey' }}>
          <ListItem
            button
            onClick={e => {
              dispatch({ type: TOGGLE_CONTACTS });
              dispatch({ type: SET_NO_ACTIVE_CHATROOM });
              console.log(toggleFriendList);
            }}>
            <ListItemText style={{ textAlign: 'center' }}>
              <Tooltip title='Contacten' placement='top-start' arrow interactive>
                {/* Contacts */}
                {props.theme === 'dark' ? <PeopleAltIcon /> : <PeopleAltIcon color='primary' />}
              </Tooltip>
            </ListItemText>
          </ListItem>
        </Grid>
        <Grid item xs={4} style={{ borderRight: '1px solid lightgrey' }}>
          <ListItem
            style={{ justifyContent: 'center' }}
            button
            onClick={e => {
              dispatch({ type: TOGGLE_CHAT });
              dispatch({ type: SET_NO_ACTIVE_CHATROOM });
              console.log(toggleFriendList);
            }}>
            {toggleFriendList === 'contacts' && totalUnreadMessages > 0 ? (
              <Badge badgeContent={totalUnreadMessages} max={9} color='secondary'>
                <ListItemText style={{ textAlign: 'center' }}>
                  <Tooltip
                    title={
                      totalUnreadMessages > 1
                        ? `${totalUnreadMessages} nieuwe berichten`
                        : `${totalUnreadMessages} nieuw bericht`
                    }
                    placement='top-start'
                    arrow
                    interactive>
                    {/* Chats */}
                    {props.theme === 'dark' ? <MessageIcon /> : <MessageIcon color='primary' />}
                  </Tooltip>
                </ListItemText>
              </Badge>
            ) : (
              <ListItemText style={{ textAlign: 'center' }}>
                <Tooltip title='Berichten' placement='top-start' arrow interactive>
                  {/* Chats */}
                  {props.theme === 'dark' ? <MessageIcon /> : <MessageIcon color='primary' />}
                </Tooltip>
              </ListItemText>
            )}
          </ListItem>
        </Grid>

        {/* Add Group */}
        <CreateGroupModal />
      </Grid>

      {/* Render chats with messages with more than 2 members */}
      {props.chatRooms && toggleFriendList === 'chats'
        ? props.chatRooms.map(room => {
            if (room.members.length > 2) {
              return <GroupChat room={room} key={room._id} />;
            }

            // Render chats with messages with max 2 members
            // Render ONLINE CHAT users: sorted: chat with last received message on top
            return (
              room.chatMessages.length > 0 &&
              room.members.map(member => {
                if (room.members.length === 2) {
                  if (
                    Object.values(props.connectedUsers).includes(member._id) &&
                    member.username !== props.user.username
                  ) {
                    return (
                      <ListItem
                        button
                        key={room._id}
                        onClick={e => {
                          console.log('click');
                          console.log(`Room Id: ${room._id}`);
                          props.getSingleChatRoom(room._id);

                          let memberId = room.members.filter(
                            member => member._id !== props.user._id,
                          );

                          props.markMessagesRead(room._id, memberId);

                          // props.socket.emit('roomId', room._id);
                        }}>
                        <ListItemIcon>
                          <StyledBadge
                            overlap='circle'
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            variant='dot'>
                            <Avatar alt={member.username.toUpperCase()} src={member.avatar} />
                          </StyledBadge>
                        </ListItemIcon>
                        <ListItemText primary={firstCharUpperCase(member.username)}></ListItemText>
                        <Badge
                          badgeContent={
                            room._id !== props.activeChatRoom._id
                              ? room.chatMessages.filter(message => {
                                  return (
                                    message.username !== props.user.username &&
                                    message.read === false
                                  );
                                }).length
                              : 0
                          }
                          color='secondary'
                          max={9}>
                          <ListItemText
                            secondary={props.lastMessages.map(lastMessage => {
                              if (lastMessage && lastMessage.chatRoomId === room._id) {
                                return lastMessage.body;
                              }
                            })}
                            align='right'></ListItemText>
                        </Badge>
                      </ListItem>
                    );
                    // Render OFFLINE CHAT users
                  } else if (member.username !== props.user.username) {
                    return (
                      <ListItem
                        button
                        key={room._id}
                        onClick={e => {
                          console.log('click');
                          console.log(`Room Id: ${room._id}`);
                          props.getSingleChatRoom(room._id);

                          let memberId = room.members.filter(
                            member => member._id !== props.user._id,
                          );

                          props.markMessagesRead(room._id, memberId);
                          // props.socket.emit('roomId', room._id);
                        }}>
                        <ListItemIcon>
                          <Avatar alt={member.username.toUpperCase()} src={member.avatar} />
                        </ListItemIcon>
                        <ListItemText primary={firstCharUpperCase(member.username)}>
                          {firstCharUpperCase(member.username)}
                        </ListItemText>

                        <Badge
                          badgeContent={
                            room._id !== props.activeChatRoom._id
                              ? room.chatMessages.filter(message => {
                                  return (
                                    message.username !== props.user.username &&
                                    message.read === false
                                  );
                                }).length
                              : 0
                          }
                          color='secondary'
                          max={9}>
                          <ListItemText
                            secondary={props.lastMessages.map(lastMessage => {
                              if (lastMessage && lastMessage.chatRoomId === room._id) {
                                return lastMessage.body;
                              }
                            })}
                            align='right'
                          />
                        </Badge>
                      </ListItem>
                    );
                  }
                }
              })
            );
          })
        : // Render ONLINE CONTACTS: sorted online users first
          props.users &&
          toggleFriendList === 'contacts' &&
          props.users.map(user => {
            if (
              Object.values(props.connectedUsers).includes(user._id) &&
              user.username !== props.user.username
            ) {
              return (
                <ListItem
                  button
                  key={user._id}
                  onClick={e => {
                    console.log('clicked ONLINE contact');
                    // console.log(props.chatRooms);
                    // console.log(user._id);
                    console.log(user);
                    checkIfContactHasChatRoom(user);

                    // console.log(`Room Id: ${room._id}`);
                    // props.getSingleChatRoom(room._id);
                    // props.socket.emit('roomId', room._id);
                  }}>
                  <ListItemIcon>
                    <StyledBadge
                      overlap='circle'
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      variant='dot'>
                      <Avatar alt={user.username.toUpperCase()} src={user.avatar} />
                    </StyledBadge>
                  </ListItemIcon>
                  <ListItemText primary={firstCharUpperCase(user.username)}>
                    {firstCharUpperCase(user.username)}
                  </ListItemText>
                </ListItem>
              );
            }
            // Render OFFLINE CONTACTS
            else if (user.username !== props.user.username) {
              return (
                <ListItem
                  button
                  key={user._id}
                  onClick={e => {
                    console.log('clicked OFFLINE contact');
                    // console.log(props.chatRooms);
                    // console.log(user._id);
                    console.log(user);

                    checkIfContactHasChatRoom(user);
                  }}>
                  <ListItemIcon>
                    <Avatar alt={user.username.toUpperCase()} src={user.avatar} />
                  </ListItemIcon>
                  <ListItemText primary={firstCharUpperCase(user.username)}>
                    {firstCharUpperCase(user.username)}
                  </ListItemText>
                  <ListItemText secondary='Offline' align='right'></ListItemText>
                </ListItem>
              );
            }
          })}
    </List>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
    user: state.user.user,
    toggleFriendList: state.chat.toggleFriendList,
    chatRooms: state.chat.chatRooms,
    lastMessages: state.chat.lastMessages,
    activeChatRoom: state.chat.activeChatRoom,
    connectedUsers: state.user.connectedUsers,
    users: state.user.users,
    theme: state.theme.theme,
  };
};

export default connect(mapStateToProps, {
  getSingleChatRoom,
  getAllUsers,
  createChatRoom,
  markMessagesRead,
})(ChatFriendsList);
