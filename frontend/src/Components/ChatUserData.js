import { useState } from 'react';
import { connect } from 'react-redux';
import { firstCharUpperCase } from '../util/helperFunctions';
import darkTheme from '../util/darkTheme';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';

// Components
import UploadAvatar from '../util/UploadAvatar';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

let color = darkTheme.palette.type === 'dark' ? '#fff' : '#3f3f3f';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
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
  paper: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    width: 600,
    height: 250,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  modalContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    // marginBottom: 10,
  },
  modalText: {
    // fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#787878',
    marginLeft: 20,
    flex: 1,
  },
  modalSubText: {
    fontSize: '1.05rem',
    color: '#787878',
    paddingTop: 50,
    paddingBottom: 10,
    alignSelf: 'center',
  },
}));

const ChatUserData = props => {
  const classes = useStyles();

  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <div className={classes.modalContainer}>
        <Avatar
          className={classes.modalAvatar}
          alt={props.user.username.toUpperCase()}
          src={props.user.avatar}
        />
        <Typography className={classes.modalText}>
          {firstCharUpperCase(props.user.username)}
        </Typography>
      </div>
      <Typography className={classes.modalSubText}>Nieuwe foto uploaden</Typography>
      <UploadAvatar handleClose={handleClose} />
    </div>
  );

  return (
    <>
      <div key={props.user._id} className={classes.container} onClick={handleOpen}>
        <Avatar
          className={classes.avatar}
          alt={props.user.username.toUpperCase()}
          src={props.user.avatar}
        />
        <Typography className={classes.text}>{firstCharUpperCase(props.user.username)}</Typography>
      </div>

      <div>
        <Modal open={open} onClose={handleClose}>
          {body}
        </Modal>
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
