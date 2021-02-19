// Redux
import { connect } from 'react-redux';

// MUI

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

const ChatFriendsList = () => {
  return (
    <List>
      <ListItem button key='RemySharp'>
        <ListItemIcon>
          <Avatar alt='Remy Sharp' src='https://material-ui.com/static/images/avatar/1.jpg' />
        </ListItemIcon>
        <ListItemText primary='Remy Sharp'>Remy Sharp</ListItemText>
        <ListItemText secondary='online' align='right'></ListItemText>
      </ListItem>
      <ListItem button key='Alice'>
        <ListItemIcon>
          <Avatar alt='Alice' src='https://material-ui.com/static/images/avatar/3.jpg' />
        </ListItemIcon>
        <ListItemText primary='Alice'>Alice</ListItemText>
      </ListItem>
    </List>
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
    data: state.data,
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(ChatFriendsList);
