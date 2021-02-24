// Redux
import { connect } from 'react-redux';

// Actions
import { getCurrentLoggedInUser } from '../redux/actions/authActions';
import { updateConnectedUserList, getAllUsers } from '../redux/actions/userActions';
import { getAllUserChatRooms } from '../redux/actions/chatMessageActions';

// React Router DOM
import { Redirect, Route } from 'react-router-dom';

// Components
import Spinner from './Spinner';

import { useEffect } from 'react';

// Socket io
import { USER_CONNECTED, USER_DISCONNECTED } from '../redux/types';

// When we specify an Authroute:
//  - getCurrentLoggedInUser checks if the user is logged in. (componentDidMount)
//  - When the user is loading, show a spinner
//  - When the user is loaded, socket.emit USER_CONNECTED to the server.
//  - When props.user._id === true, it means the user is logged in. Render the passed in component (props.component)
//  - When props.user._id === false, it means the user is not logged in. redirect to /login

const AuthRoute = props => {
  // componentDidMount
  useEffect(() => {
    props.getCurrentLoggedInUser();
    props.getAllUserChatRooms();
  }, []);

  // Connected user list
  useEffect(() => {
    // When the user is set, emit the user to the backend, where the user is added to the connected userList.
    if (props.user._id) {
      props.socket.emit(USER_CONNECTED, props.user);
      console.log('user is set');

      // Receive the connected users userList from the backend
      props.socket.on(USER_CONNECTED, userListFromBackend => {
        console.log(userListFromBackend);
        // TODO dispatch action to update props.connectedUsers
        props.updateConnectedUserList(userListFromBackend);
      });

      // Receive the updated connected users userList from the backend
      props.socket.on(USER_DISCONNECTED, userListFromBackend => {
        console.log(userListFromBackend);
        // TODO dispatch action to update props.connectedUsers
        props.updateConnectedUserList(userListFromBackend);
      });
    }
  }, [props.user._id]);

  // Render
  return (
    <Route
      render={() =>
        props.loading ? (
          <Spinner />
        ) : props.user._id ? (
          <props.component />
        ) : (
          <Redirect to='/login' />
        )
      }
    />
  );
};

const mapStateToProps = state => {
  return {
    socket: state.socket.socket,
    user: state.user.user,
    loading: state.user.loading,
  };
};

export default connect(mapStateToProps, {
  getCurrentLoggedInUser,
  updateConnectedUserList,
  getAllUserChatRooms,
})(AuthRoute);
