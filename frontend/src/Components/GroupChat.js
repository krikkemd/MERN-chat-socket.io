// Redux
import { connect } from 'react-redux';

// Redux ChatMessage Actions
import { getSingleChatRoom, markMessagesRead } from '../redux/actions/chatMessageActions';

// MUI
import { withStyles } from '@material-ui/core/styles';
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

const GroupChat = props => {
  console.log(props);
  if (props.chatRooms) {
    return props.chatRooms.map(room => {
      if (room.members.length > 2) {
        return (
          <ListItem
            button
            key={room._id}
            onClick={e => {
              console.log('click');
              console.log(room);
              console.log(`Room Id: ${room._id}`);
              props.getSingleChatRoom(room._id);

              let memberId = room.members.filter(member => member._id !== props.user._id);

              //   messageReadBy =  read
              props.markMessagesRead(room._id, memberId);
            }}>
            <ListItemIcon>
              <Avatar alt={'photo'} />
            </ListItemIcon>
            <ListItemText primary={room.name}></ListItemText>
            <Badge
              badgeContent={
                room._id !== props.activeChatRoom._id
                  ? room.chatMessages.filter(message => {
                      return message.username !== props.user.username && message.read === false;
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
      }
    });
  }
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

export default connect(mapStateToProps, { getSingleChatRoom, markMessagesRead })(GroupChat);
