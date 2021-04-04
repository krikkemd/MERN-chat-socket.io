import { useEffect, useState } from 'react';

// Redux
import { connect, useDispatch } from 'react-redux';

// Redux chatMessage actions
import { createChatRoom } from '../redux/actions/chatMessageActions';

// Helper
import { firstCharUpperCase } from '../util/helperFunctions';

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import { CLEAR_ERRORS, SET_ERRORS } from '../redux/types';

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

const CreateGroupModal = props => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState([]);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [groupName, setGroupName] = useState('');

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

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
    let users = [];
    props.users.map(user => {
      return props.user._id !== user._id && users.push(user);
    });
    setLeft(users);
    console.log(users);
  }, [open]);

  //   Enable the submit button when 2 or more users are selected, + add current user
  const handleSubmit = (e, selectedUsers) => {
    e.preventDefault();
    console.log(groupName);
    selectedUsers = [...selectedUsers, props.user];

    if (selectedUsers.length <= 2)
      return dispatch({ type: SET_ERRORS, payload: 'Groep heeft te weinig leden' });

    selectedUsers.forEach(user => {
      console.log(user._id);
    });

    props.createChatRoom(
      props.socket,
      groupName,
      selectedUsers.map(user => user._id),
    );

    // When ready
    setGroupName('');
  };

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
        <Grid item>{customList('Selecteer min 2 & max 9 leden', left)}</Grid>
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
        <Grid item>{customList('Geselecteerd', right)}</Grid>
      </Grid>

      {/* Form */}
      <form
        onSubmit={e => {
          console.log('submit create group');
          handleSubmit(e, right);
        }}
        className={classes.input}
        noValidate
        autoComplete='off'>
        <TextField
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
        />
        <Button
          disabled={right.length > 1 ? false : true}
          onClick={e => {
            console.log('submit create group');
            handleSubmit(e, right);
          }}
          variant='contained'
          color='primary'>
          Groep Aanmaken
        </Button>
      </form>
    </>
  );

  return (
    <>
      <Grid item xs={4}>
        <ListItem
          button
          onClick={e => {
            console.log('createNewGroup Modal');
            handleOpen();
            // toggle open modal with transfer list
            // Select users inside the transfer list (max?)
            // createGroup.then(close modal)
            // Render new group (for all members?)
          }}>
          <ListItemText style={{ textAlign: 'center' }}>
            <Tooltip title='Nieuwe Groep Maken' placement='top-start' arrow interactive>
              {/* Add Group */}
              {props.theme === 'dark' ? <GroupAddIcon /> : <GroupAddIcon color='primary' />}
            </Tooltip>
          </ListItemText>
        </ListItem>
      </Grid>

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
    errors: state.user.errors,
    theme: state.theme.theme,
  };
};

export default connect(mapStateToProps, { createChatRoom })(CreateGroupModal);
