import { useEffect, useState } from 'react';

// Redux
import { connect, useDispatch } from 'react-redux';

// Redux chatMessage actions
import { updateChatRoom } from '../redux/actions/chatMessageActions';

// Types
import { SET_ERRORS, ADDED_USERS_TO_CHATROOM } from '../redux/types';

// Helper
import { firstCharUpperCase } from '../util/helperFunctions';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles(theme => ({
  root: {
    margin: 'auto',
    width: 'fit-content',
    border: 'none',
    outline: 'none',
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    width: 300,
    height: '50vh',
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing(0.5, 0),
    backgroundColor: theme.palette.background.paper,
  },
  input: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
}));

function not(a, b) {
  return a.filter(value => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter(value => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

const JoinChatRoomModal = props => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState([]);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const { socket } = props;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRight([]);
  };

  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = items => intersection(checked, items).length;

  const handleToggleAll = items => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  // Add users to left item list ComponentDidMount
  useEffect(() => {
    console.log('Add users left');
    let users = [...props.users];
    let indexes = [];

    console.log(users);
    console.log(props.users);
    console.log(props.activeChatRoom.members);

    // If a user is already member of the chatroom, splice the user from the selectable userlist
    for (let i = 0; i < users.length; i++) {
      //   console.log(users[i]._id);
      for (let j = 0; j < props.activeChatRoom.members.length; j++) {
        if (users[i]._id === props.activeChatRoom.members[j]._id) {
          // console.log(users[i]);
          console.log(props.activeChatRoom.members[j]);

          console.log(users.indexOf(users[i]));
          indexes.push(users.indexOf(users[i]));

          // splice at the index where the id's match
          // console.log(users.splice(users.indexOf(users[i]), 1));
        }
      }
    }

    console.log(indexes);

    // Remove indexes
    function spliceUserIndexes(arr) {
      let remove = indexes;
      for (let i = remove.length - 1; i >= 0; i--) {
        arr.splice(remove[i], 1);
      }
    }

    spliceUserIndexes(users);
    setLeft(users);
    console.log(users);
  }, [open]);

  //   Enable the submit button when 2 or more users are selected, + add current user
  const handleSubmit = (e, selectedUsers) => {
    e.preventDefault();
    // console.log(groupName);
    let socketIds = [];
    let selectedUsersMinusMembers = [...selectedUsers];
    selectedUsers = [...props.activeChatRoom.members, ...selectedUsers];

    // geselecteerde users zonder hudige members
    console.log(selectedUsersMinusMembers);

    // online users's objects containing their socket ids so we can add them to the socket.room on the server side
    console.log(props.usersWithSockets);

    props.usersWithSockets.map((user, i) => {
      // console.log(user.user._id);
      selectedUsersMinusMembers.findIndex((selUser, j) => {
        // console.log(selUser);
        if (user.user._id === selUser._id) {
          console.log(user.user);
          socketIds.push(user.user.socketId);
        }
      });
    });

    console.log('socketIds of online users added to the chatroom. add to socket.room on server');
    console.log(socketIds);

    // geselecteerde members inclusief huidige members
    // console.log(selectedUsers);

    // Huidige members already present in room
    // console.log(props.activeChatRoom.members);

    if (selectedUsers.length > 10) {
      alert('Groep heeft teveel leden (max 10)');
      return dispatch({ type: SET_ERRORS, payload: 'Groep heeft teveel leden (max 10)' });
    }

    // selectedUsers.forEach(user => {
    //   console.log(user._id);
    // });

    props.updateChatRoom(
      socket,
      props.activeChatRoom._id,
      socketIds,
      selectedUsers.map(user => user._id),
    );
  };

  useEffect(() => {
    if (socket._callbacks !== undefined && socket._callbacks['$ADDED_USERS_TO_CHATROOM']) {
      socket._callbacks['$ADDED_USERS_TO_CHATROOM'].length = 0;
    }

    socket.on(ADDED_USERS_TO_CHATROOM, data => {
      console.log('ADDED_USERS_TO_CHATROOM');
      console.log(data);
      handleClose();
      dispatch({ type: ADDED_USERS_TO_CHATROOM, payload: { data } });
    });
  }, [props.chatRooms]);

  const customList = (title, items) => {
    return (
      <Card>
        <CardHeader
          className={classes.cardHeader}
          avatar={
            <Checkbox
              onClick={handleToggleAll(items)}
              checked={numberOfChecked(items) === items.length && items.length !== 0}
              indeterminate={
                numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0
              }
              disabled={items.length === 0}
              inputProps={{ 'aria-label': 'all items selected' }}
            />
          }
          title={title}
          subheader={`${numberOfChecked(items)}/${items.length} geselecteerd`}
        />
        <Divider />
        <List className={classes.list} dense component='div' role='list'>
          {items.map(value => {
            const labelId = `transfer-list-all-item-${value}-label`;

            return (
              <ListItem key={value._id} role='listitem' button onClick={handleToggle(value)}>
                <ListItemIcon>
                  <Avatar src={value.avatar}></Avatar>
                </ListItemIcon>
                <ListItemText id={labelId} primary={firstCharUpperCase(value.username)} />
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </Card>
    );
  };

  const modalBody = (
    <>
      <Grid container spacing={2} justify='center' alignItems='center' className={classes.root}>
        <Grid item>
          {customList(`Groep heeft ${props.activeChatRoom.members.length} leden (max 10)`, left)}
        </Grid>
        <Grid item>
          <Grid container direction='column' alignItems='center'>
            <Button
              variant='outlined'
              size='small'
              className={classes.button}
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label='move selected right'>
              &gt;
            </Button>
            <Button
              variant='outlined'
              size='small'
              className={classes.button}
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label='move selected left'>
              &lt;
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          {customList(
            `selecteer maximaal ${10 - props.activeChatRoom.members.length} leden`,
            right,
          )}
        </Grid>
      </Grid>

      {/* Form */}
      <form
        onSubmit={e => {
          console.log('submit add users to group');
          handleSubmit(e, right);
        }}
        className={classes.input}
        noValidate
        autoComplete='off'>
        {/* <TextField
          value={groupName}
          onChange={e => {
            dispatch({ type: CLEAR_ERRORS });
            setGroupName(e.target.value);
          }}
          id='standard-basic'
          label='Groepsnaam'
          error={props.errors && props.errors.length > 0 ? true : false}
          helperText={
            props.errors && props.errors.length > 0 ? props.errors[props.errors.length - 1] : ''
          }
        /> */}
        <Button
          disabled={right.length >= 1 ? false : true}
          onClick={e => {
            console.log('submit add users to group');
            handleSubmit(e, right);
          }}
          variant='contained'
          color='primary'>
          toevoegen
        </Button>
      </form>
    </>
  );

  return (
    <>
      <MenuItem
        onClick={handleOpen}
        disabled={props.activeChatRoom.moderator !== props.user._id ? true : false}>
        Gebruiker(s) toevoegen
      </MenuItem>

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
    </>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
    user: state.user.user,
    users: state.user.users,
    usersWithSockets: state.user.usersWithSockets,
    activeChatRoom: state.chat.activeChatRoom,
    errors: state.user.errors,
    theme: state.theme.theme,
  };
};

export default connect(mapStateToProps, { updateChatRoom })(JoinChatRoomModal);
