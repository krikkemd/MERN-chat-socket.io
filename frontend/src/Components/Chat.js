// Redux
import { connect } from 'react-redux';

// Redux Actions
import {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
  emitCreateChatMessageFromServerToAllClients,
  emitDeleteChatMessageFromServerToAllClients,
} from '../redux/actions/chatMessageActions';

// Components
import ChatFriendsList from './ChatFriendsList';

// Receive from server types:
import { OUTPUT_CHAT_MESSAGE, DELETED_CHAT_MESSAGE } from '../redux/types';

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
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';

import noImg from '../images/no-img.png';
import ChatMessageArea from './ChatMessageArea';

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

const Chat = props => {
  console.log(props.user.username);
  const classes = useStyles();

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
          <ChatFriendsList />

          {/*  */}
        </Grid>
        <Grid item xs={9}>
          {/* Chat Message Area */}
          <ChatMessageArea classes={classes} />

          {/*  */}
        </Grid>
      </Grid>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
    data: state.data,
    user: state.user.user,
  };
};

export default connect(mapStateToProps, {
  getAllChatMessages,
  createChatMessage,
  deleteChatMessage,
  emitCreateChatMessageFromServerToAllClients,
  emitDeleteChatMessageFromServerToAllClients,
})(Chat);
