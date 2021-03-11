import Grid from '@material-ui/core/Grid';
import { makeStyles, useTheme } from '@material-ui/core/styles';

// Components

import ChatUserData from './ChatUserData';
import ChatHeader from './ChatHeader';
import ChatFriendList from './ChatFriendsList';
import ChatMessageArea from './ChatMessageArea';
import ChatInput from './ChatInput';

const useStyles = makeStyles(theme => ({
  userData: {
    backgroundColor: theme.palette.primary.main,
    borderRight: '1px solid lightgrey',
    borderBottom: '1px solid lightgrey',
  },
  header: {
    backgroundColor: theme.palette.primary.main,
    flex: 1,
    borderBottom: '1px solid lightgrey',
  },
  list: {
    minHeight: '85vh',
    borderRight: '1px solid lightgrey',
    borderBottom: '1px solid lightgrey',
  },
  chatMessages: {
    height: '64vh',
    overflowY: 'auto',
    borderBottom: '1px solid lightgrey',
  },
  input: {
    paddingTop: 60,
    padding: 60,
    borderBottom: '1px solid lightgrey',
  },
}));

const Mui = () => {
  const theme = useTheme();
  const classes = useStyles(theme);

  console.log(classes);
  return (
    <>
      <Grid container>
        {/* User Data */}
        <Grid item xs={3} className={classes.userData}>
          <ChatUserData />
        </Grid>
        <Grid item xs={9} className={classes.header}>
          <ChatHeader />
        </Grid>
      </Grid>

      {/* Friends list */}
      <Grid container xs={12}>
        <Grid item xs={3} className={classes.list}>
          <ChatFriendList />
        </Grid>

        {/* Chat Messages */}
        <Grid container xs={9} md={9}>
          <Grid item xs={12} className={classes.chatMessages}>
            <ChatMessageArea />
          </Grid>
          <Grid item xs={12} className={classes.input}>
            <ChatInput />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Mui;
