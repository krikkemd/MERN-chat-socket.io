import { connect } from 'react-redux';
import { firstCharUpperCase } from '../util/helperFunctions';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

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
