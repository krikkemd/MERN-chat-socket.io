import { useEffect } from 'react';
// Redux
import { connect, useDispatch } from 'react-redux';

// Redux ChatMessage Actions
import {
  createChatMessage,
  getSingleChatRoom,
  markMessagesRead,
} from '../redux/actions/chatMessageActions';

// Redux Types
import { LEFT_CHATROOM } from '../redux/types';

// MUI
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

const GroupChat = props => {
  // console.log(props);
  const { room, socket } = props;

  const dispatch = useDispatch();

  useEffect(() => {
    if (socket._callbacks !== undefined && socket._callbacks['$LEFT_CHATROOM']) {
      socket._callbacks['$LEFT_CHATROOM'].length = 0;
    }

    socket.on(LEFT_CHATROOM, ({ roomId, leftUserId, username }) => {
      console.log('👻🐒');
      console.log(socket);
      console.log(roomId);
      console.log(leftUserId);

      dispatch({ type: LEFT_CHATROOM, payload: { roomId, leftUserId, username } });
    });
  }, [props.chatRooms]);

  return (
    <ListItem
      key={room._id}
      button
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
        <AvatarGroup max={2} spacing='medium'>
          {room.members.map(member => {
            if (member._id !== props.user._id) {
              return <Avatar alt={member.username} src={member.avatar} key={member._id} />;
            }
            return null;
          })}
        </AvatarGroup>
      </ListItemIcon>
      <ListItemText
        primary={room.name}
        style={{
          minWidth: 179.52,
          marginLeft: 10,
          marginRight: 10,
        }}></ListItemText>
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
            return null;
          })}
          align='right'></ListItemText>
      </Badge>
    </ListItem>
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

export default connect(mapStateToProps, { getSingleChatRoom, markMessagesRead, createChatMessage })(
  GroupChat,
);
