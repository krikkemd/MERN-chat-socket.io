import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

// Redux
import { connect } from 'react-redux';

// actions
import { leaveChatRoom } from '../redux/actions/chatMessageActions';

import JoinChatRoomModal from '../util/joinChatRoomModal';

// Helper Functions
import { firstCharUpperCase } from '../util/helperFunctions';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 20,
    paddingLeft: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    border: 'none',
  },
  members: {
    fontWeight: 'bold',
    marginLeft: 20,
    marginRight: 10,
  },
  text: {
    color: '#fff',
  },
}));

const ChatHeader = props => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const { user, activeChatRoom, leaveChatRoom, socket } = props;

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handeLeaveChatRoom = roomId => {
    console.log('running handleLeaveChatRoom');
    console.log(roomId);

    console.log(activeChatRoom);

    if (window.confirm('Weet u zeker dat u de groep wilt verlaten?')) {
      // leaveChatRoom(socket, roomId, user.username);
      leaveChatRoom(socket, roomId, user);
      handleClose();
      // socket.emit(LEAVE_CHATROOM, roomId, user);
    } else {
      handleClose();
    }
  };

  const contact = activeChatRoom.members?.filter(member =>
    user._id !== member._id ? member : null,
  );

  return (
    <div className={classes.container}>
      {/* 2 chat room members */}
      {contact && activeChatRoom.members.length === 2 && !activeChatRoom.name && (
        <>
          <Avatar
            className={classes.avatar}
            alt={contact && contact[0]?.username.toUpperCase()}
            src={contact && contact[0]?.avatar}
          />
          <Typography variant='caption' className={classes.text}>
            <Typography variant='caption' className={classes.members}>
              Leden:
            </Typography>
            {activeChatRoom.members.map(
              member =>
                `${firstCharUpperCase(member.username)}${
                  member !== activeChatRoom.members[activeChatRoom.members.length - 1] ? ',' : ''
                } `,
            )}
          </Typography>
        </>
      )}

      {/* More than 2 chat room members */}
      {contact && activeChatRoom.members.length >= 1 && activeChatRoom.name && (
        <>
          <AvatarGroup max={5}>
            {activeChatRoom.members.map(member => {
              return (
                <Avatar
                  key={member._id}
                  className={classes.avatar}
                  alt={member.username.toUpperCase()}
                  src={member.avatar}></Avatar>
              );
            })}
          </AvatarGroup>
          <Typography variant='caption' className={classes.text}>
            <Typography variant='caption' className={classes.members}>
              Leden:
            </Typography>
            {activeChatRoom.members.map(
              member =>
                `${firstCharUpperCase(member.username)}${
                  member !== activeChatRoom.members[activeChatRoom.members.length - 1] ? ',' : ''
                } `,
            )}
          </Typography>

          {/* Leave Group Button */}
          <div style={{ marginLeft: 'auto', marginRight: 20, zIndex: 1 }}>
            <IconButton>
              <SettingsIcon onClick={handleClick} style={{ color: 'white' }} />
              <Menu
                id='simple-menu'
                style={{ zIndex: 2 }}
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}>
                <MenuItem
                  onClick={() => {
                    handeLeaveChatRoom(activeChatRoom._id);
                  }}>
                  Groep Verlaten
                </MenuItem>
                <JoinChatRoomModal />
              </Menu>
            </IconButton>
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    user: state.user.user,
    activeChatRoom: state.chat.activeChatRoom,
    socket: state.socket.socket,
  };
};

export default connect(mapStateToProps, { leaveChatRoom })(ChatHeader);
