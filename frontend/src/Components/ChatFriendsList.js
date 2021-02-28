import { useEffect } from 'react';

// Redux
import { connect } from 'react-redux';

// Redux actions
import { getSingleChatRoom } from '../redux/actions/chatMessageActions';

// MUI
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

const ChatFriendsList = props => {
  // Props
  // console.log(props);
  console.log('rendering friendslist!');

  // authroute calls getsAllUserRooms, which queries the chatrooms with {req.user._id} where the current logged in user is a member of.
  // We add the chatrooms to the redux state
  // we render the chatrooms, with the name of the member that is not the currentUser
  // onCLick => getChatMessages from that room with the room._id + we socket.join('clickedRoom') server side, and leave all other rooms.

  // useEffect(() => {
  //   console.log('rerender');
  //   props.chatRooms.sort((a, b) => {
  //     console.log(a.chatMessages[0].createdAt);
  //     // return Date.parse(a.chatMessages[0].createdAt) > Date.parse(b.chatMessages[0].createdAt);
  //     return new Date(b.chatMessages[0].createdAt) - new Date(a.chatMessages[0].createdAt);
  //   });

  //   console.log(props.chatRooms);

  // }, [props]);

  return (
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
                    // props.socket.emit('roomId', room._id);
                  }}>
                  <ListItemIcon>
                    <Avatar
                      alt={member.username}
                      src='https://material-ui.com/static/images/avatar/1.jpg'
                    />
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
      ) : (
        <div>no rooms</div>
      )}
    </List>
  );
};

const mapStateToProps = state => {
  return {
    user: state.user.user,
    chatMessages: state.chat.chatMessages,
    chatRooms: state.chat.chatRooms,
    lastMessages: state.chat.lastMessages,
    socket: state.socket.socket,
  };
};

export default connect(mapStateToProps, { getSingleChatRoom })(ChatFriendsList);
