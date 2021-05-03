// Redux
import { connect } from 'react-redux';

// Components
import ChatFriendsList from './ChatFriendsList';

// Helper functions
import { firstCharUpperCase } from '../util/helperFunctions';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import ChatMessageArea from './ChatMessageArea';
import ChatHeader from './ChatHeader';

const useStyles = makeStyles({
  table: {
    // minWidth: 650,
  },
  chatSection: {
    width: '100%',
    // height: '80vh',
  },
  headBG: {
    backgroundColor: '#e0e0e0',
  },
  borderRight500: {
    borderRight: '1px solid #e0e0e0',
  },
  messageArea: {
    height: '60vh',
    overflowY: 'auto',
  },
});

const Chat = props => {
  const classes = useStyles();

  return (
    <div>
      <Grid container></Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={3} className={classes.borderRight500}>
          <List>
            <ListItem button key={props.user._id}>
              <ListItemIcon>
                <Avatar alt={props.user.username.toUpperCase()} src={props.user.avatar} />
              </ListItemIcon>
              <ListItemText primary={firstCharUpperCase(props.user.username)}></ListItemText>
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
          {/* Header */}
          <ChatHeader />

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
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(Chat);
