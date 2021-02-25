// Redux
import { connect } from 'react-redux';

// Actions
import { getCurrentLoggedInUser } from '../redux/actions/authActions';
import { updateConnectedUserList } from '../redux/actions/userActions';
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
  const {
    getCurrentLoggedInUser,
    getAllUserChatRooms,
    updateConnectedUserList,
    socket,
    user,
  } = props;

  // componentDidMount
  useEffect(() => {
    getCurrentLoggedInUser();
  }, [getCurrentLoggedInUser]);

  // Connected user list
  useEffect(() => {
    // When the user is set, emit the user to the backend, where the user is added to the connected userList.
    if (user._id) {
      // Get all the chatRooms the user is a member of when the user is set
      getAllUserChatRooms();

      socket.emit(USER_CONNECTED, user);
      console.log('user is set');

      // Receive the connected users userList from the backend
      socket.on(USER_CONNECTED, userListFromBackend => {
        console.log(userListFromBackend);
        // TODO dispatch action to update props.connectedUsers
        updateConnectedUserList(userListFromBackend);
      });

      // Receive the updated connected users userList from the backend
      socket.on(USER_DISCONNECTED, userListFromBackend => {
        console.log(userListFromBackend);
        // TODO dispatch action to update props.connectedUsers
        updateConnectedUserList(userListFromBackend);
      });
    }
  }, [updateConnectedUserList, socket, user, getAllUserChatRooms]);

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
