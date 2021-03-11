import { connect } from 'react-redux';
import { firstCharUpperCase } from '../util/helperFunctions';

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

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  text: {
    color: '#fff',
    marginLeft: 20,
  },
}));

const ChatUserData = props => {
  const classes = useStyles();
  return (
    <>
      <div key={props.user._id} className={classes.container}>
        <Avatar
          className={classes.avatar}
          alt={props.user.username.toUpperCase()}
          src={props.user.avatar}
        />
        <Typography className={classes.text}>{firstCharUpperCase(props.user.username)}</Typography>
      </div>
    </>
  );
};

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(ChatUserData);
