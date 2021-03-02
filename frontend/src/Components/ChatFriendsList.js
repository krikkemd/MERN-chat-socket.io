import { useState, useEffect } from 'react';

// Redux
import { connect } from 'react-redux';

// Redux actions
import { getAllUsers } from '../redux/actions/userActions';
import { getSingleChatRoom } from '../redux/actions/chatMessageActions';

// MUI
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

// online badge icon
const StyledBadge = withStyles(theme => ({
  badge: {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: '$ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}))(Badge);

const ChatFriendsList = props => {
  // authroute calls getsAllUserRooms, which queries the chatrooms with {req.user._id} where the current logged in user is a member of.
  // We add the chatrooms to the redux state
  // we render the chatrooms, with the name of the member that is not the currentUser
  // onCLick => getChatMessages from that room with the room._id + we socket.join('clickedRoom') server side, and leave all other rooms.

  useEffect(() => {
    props.getAllUsers();
  }, []);

  console.log(Object.values(props.connectedUsers));

  const [toggleChat, setToggleChat] = useState('contacts');

  return (
    <List>
      <Grid container justify='space-between'>
        <Grid item xs={5}>
          <ListItem
            button
            onClick={e => {
              setToggleChat('contacts');
              console.log(toggleChat);
            }}>
            <ListItemText primary='Contacts' style={{ textAlign: 'center' }}>
              Contacts
            </ListItemText>
          </ListItem>
        </Grid>
        <Divider orientation='vertical' flexItem />
        <Grid item xs={5}>
          <ListItem
            button
            onClick={e => {
              setToggleChat('chats');
              console.log(toggleChat);
            }}>
            <ListItemText primary='Chats' style={{ textAlign: 'center' }}>
              Chats
            </ListItemText>
          </ListItem>
        </Grid>
      </Grid>

      {/* Render chats with messages */}
      {props.chatRooms && toggleChat === 'chats'
        ? props.chatRooms.map(room => {
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
                      // props.socket.emit('roomId', room._id);
                    }}>
                    <ListItemIcon>
                      <Avatar alt={member.username} src={member.avatar} />
                    </ListItemIcon>
                    <ListItemText primary={member.username}>{member.username}</ListItemText>
                    <ListItemText
                      secondary={props.lastMessages.map(lastMessage => {
                        if (lastMessage.chatRoomId === room._id) {
                          return lastMessage.body;
                        }
                      })}
                      align='right'></ListItemText>
                  </ListItem>
                );
              }
            });
          })
        : // Render ONLINE users
          props.users &&
          toggleChat === 'contacts' &&
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
                    console.log('clicked in contacts');
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
                      <Avatar alt={user.username} src={user.avatar} />
                    </StyledBadge>
                  </ListItemIcon>
                  <ListItemText primary={user.username}>{user.username}</ListItemText>
                </ListItem>
              );
            }
            // Render OFFLINE users
            else if (user.username !== props.user.username) {
              return (
                <ListItem
                  button
                  key={user._id}
                  onClick={e => {
                    console.log('clicked in contacts');
                    // console.log(`Room Id: ${room._id}`);
                    // props.getSingleChatRoom(room._id);
                    // props.socket.emit('roomId', room._id);
                  }}>
                  <ListItemIcon>
                    <Avatar alt={user.username} src={user.avatar} />
                  </ListItemIcon>
                  <ListItemText primary={user.username}>{user.username}</ListItemText>
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
    user: state.user.user,
    chatRooms: state.chat.chatRooms,
    lastMessages: state.chat.lastMessages,
    connectedUsers: state.user.connectedUsers,
    users: state.user.users,
    // socket: state.socket.socket,
  };
};

export default connect(mapStateToProps, { getSingleChatRoom, getAllUsers })(ChatFriendsList);
