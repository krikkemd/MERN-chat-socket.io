import { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import axios from '../config/axios';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

// Icons
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CancelIcon from '@material-ui/icons/Cancel';

import { UPDATE_AVATAR } from '../redux/types';

const url = `http://localhost:1337/api/v1/users/updateMe`;

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  input: {
    display: 'none',
  },
  photoIcon: {
    height: 40,
    width: 40,
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  uploadButton: {
    marginLeft: 20,
  },
}));

const UploadAvatar = props => {
  console.log(props);

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

        // handleClose();
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
        <label htmlFor='icon-button-file'>
          <IconButton color='primary' aria-label='upload picture' component='span'>
            <PhotoCamera className={classes.photoIcon} />
          </IconButton>
        </label>
      ) : (
        <div className={classes.buttonContainer}>
          <Button
            variant='contained'
            color='secondary'
            component='span'
            onClick={props.handleClose}
            startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            className={classes.uploadButton}
            variant='contained'
            color='primary'
            component='span'
            onClick={handleSubmit}
            startIcon={<CloudUploadIcon />}>
            Upload
          </Button>
        </div>
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
