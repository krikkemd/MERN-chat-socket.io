import { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import axios from '../config/axios';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

// Icons
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CancelIcon from '@material-ui/icons/Cancel';

import { UPDATE_AVATAR } from '../redux/types';

const url = `${process.env.REACT_APP_API_URL}/api/v1/users/updateMe`;

const useStyles = makeStyles(theme => theme.UploadAvatar);

const UploadAvatar = props => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [file, setFile] = useState(null);

  const handleChange = e => {
    console.log(e.target.files[0]);
    setFile(e.target.files[0]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const data = new FormData();
    data.append('avatar', file);
    axios
      .patch(url, data)
      .then(res => {
        console.log(res);
        setFile(null);
        // DISPATCH UPDATE AVATAR
        props.socket.emit(UPDATE_AVATAR, res.data.user);
        dispatch({ type: UPDATE_AVATAR, payload: res.data.user });

        // Success snackbar
      })
      .catch(err => console.log(err));
  };

  return (
    <div className={classes.container}>
      <input
        onChange={handleChange}
        accept='image/*'
        className={classes.input}
        id='icon-button-file'
        type='file'
      />
      {!file ? (
        <>
          <Typography className={classes.text}>Nieuwe foto uploaden</Typography>
          <label htmlFor='icon-button-file'>
            <IconButton color='primary' aria-label='upload picture' component='span'>
              <PhotoCamera className={classes.photoIcon} />
            </IconButton>
          </label>
        </>
      ) : (
        <>
          <Typography className={classes.text}>{file.name}</Typography>
          <div className={classes.buttonContainer}>
            <Button
              color='primary'
              component='span'
              onClick={props.handleClose}
              startIcon={<CancelIcon />}>
              Annuleren
            </Button>
            <Button
              className={classes.uploadButton}
              color='secondary'
              component='span'
              onClick={handleSubmit}
              startIcon={<CloudUploadIcon />}>
              Uploaden
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
  };
};

export default connect(mapStateToProps)(UploadAvatar);
