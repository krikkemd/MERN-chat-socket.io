import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';

// Redux
import { connect } from 'react-redux';

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
  console.log(props);

  const { user, activeChatRoom } = props;

  const contact = activeChatRoom.members?.filter(member =>
    user._id !== member._id ? member : null,
  );

  return (
    <div className={classes.container}>
      {/* 2 chat room members */}
      {contact && activeChatRoom.members.length === 2 && (
        <>
          <Avatar
            className={classes.avatar}
            alt={contact && contact[0]?.username.toUpperCase()}
            src={contact && contact[0]?.avatar}
          />
          <Typography variant='caption' className={classes.text}>
            <Typography variant='caption' className={classes.members}>
              Members:
            </Typography>
            {activeChatRoom.members.map(
              member =>
                `${firstCharUpperCase(member.username)} ${
                  member !== activeChatRoom.members[activeChatRoom.members.length - 1] ? '&' : ''
                } `,
            )}
          </Typography>
        </>
      )}

      {/* > 2 chat room members */}
      {contact && activeChatRoom.members.length > 2 && (
        <>
          <Avatar className={classes.avatar} />
          <Typography variant='caption' className={classes.text}>
            <Typography variant='caption' className={classes.members}>
              Members:
            </Typography>
            {activeChatRoom.members.map(
              member =>
                `${firstCharUpperCase(member.username)} ${
                  member !== activeChatRoom.members[activeChatRoom.members.length - 1] ? '&' : ''
                } `,
            )}
          </Typography>
        </>
      )}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    user: state.user.user,
    activeChatRoom: state.chat.activeChatRoom,
  };
};

export default connect(mapStateToProps)(ChatHeader);
