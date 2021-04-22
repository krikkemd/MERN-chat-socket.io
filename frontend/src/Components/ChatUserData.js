import { useState } from 'react';
import { connect } from 'react-redux';
import { firstCharUpperCase } from '../util/helperFunctions';

import { logout } from '../redux/actions/userActions';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import IconButton from '@material-ui/core/IconButton';

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

const useStyles = makeStyles(theme => {
  // console.log(theme.chatUserData);
  return theme.chatUserData;
});

const ChatUserData = props => {
  const classes = useStyles();
  console.log(classes);
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const modalBody = (
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
      <UploadAvatar handleClose={handleClose} />
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title='Profiel' placement='bottom' arrow interactive>
        <div key={props.user._id} className={classes.container} onClick={handleOpen}>
          <Avatar
            className={classes.avatar}
            alt={props.user.username.toUpperCase()}
            src={props.user.avatar}
          />
          <Typography className={classes.text}>
            {firstCharUpperCase(props.user.username)}
          </Typography>
        </div>
      </Tooltip>

      <Tooltip
        title='Klik om uit te loggen'
        arrow
        interactive
        style={{ marginLeft: 'auto', marginTop: 'auto' }}>
        <IconButton>
          <ExitToAppIcon onClick={logout}>logout</ExitToAppIcon>
        </IconButton>
      </Tooltip>

      <div>
        <Modal
          className={classes.modal}
          open={open}
          onClose={handleClose}
          aria-labelledby='simple-modal-title'
          aria-describedby='simple-modal-description'>
          {modalBody}
        </Modal>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(ChatUserData);
