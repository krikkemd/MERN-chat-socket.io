// Redux
import { connect } from 'react-redux';

// MUI

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

const ChatFriendsList = props => {
  console.log(props);
  console.log(Object.keys(props.connectedUsers));
  return (
    <List>
      {props.connectedUsers &&
        Object.keys(props.connectedUsers).map(user => {
          if (user !== props.user.username) {
            return (
              <ListItem button key={user}>
                <ListItemIcon>
                  <Avatar alt={user} src='https://material-ui.com/static/images/avatar/1.jpg' />
                </ListItemIcon>
                <ListItemText primary={user}>{user}</ListItemText>
                <ListItemText secondary='online' align='right'></ListItemText>
              </ListItem>
            );
          }
        })}
    </List>
  );
};

const mapStateToProps = state => {
  return {
    connectedUsers: state.user.connectedUsers,
    socket: state.socket.socket,
    data: state.data,
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(ChatFriendsList);
