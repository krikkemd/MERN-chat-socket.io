// Redux
import { connect, useDispatch } from 'react-redux';

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
import {
  USER_CONNECTED,
  USER_DISCONNECTED,
  SEND_USER_SOCKET,
  SEND_BACK_USER_SOCKET,
  UPDATE_USERS_WITH_SOCKETS,
} from '../redux/types';

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

  const dispatch = useDispatch();

  // componentDidMount
  useEffect(() => {
    getCurrentLoggedInUser();
  }, [getCurrentLoggedInUser]);

  // Connected user list
  useEffect(() => {
    // When the user is set, emit the user to the backend, where the user is added to the connected userList.
    if (user._id) {
      // Get all the chatRooms the user is a member of when the user is set
      getAllUserChatRooms(`members=${user._id}`);

      socket.emit(USER_CONNECTED, user);
      console.log(socket.id);
      // socket.emit(SEND_USER_SOCKET, { user: { ...user, socketId: socket.id } });
      console.log('user is set');

      // Receive the connected users userList from the backend
      socket.on(USER_CONNECTED, userListFromBackend => {
        console.log('USER CONNECTED 🧙‍♂️');
        console.log(userListFromBackend);
        // TODO dispatch action to update props.connectedUsers
        updateConnectedUserList(userListFromBackend);
        socket.emit(SEND_USER_SOCKET, { user: { ...user, socketId: socket.id } });
      });

      // Receive the updated connected users userList from the backend
      socket.on(USER_DISCONNECTED, userListFromBackend => {
        console.log(userListFromBackend);
        // TODO dispatch action to update props.connectedUsers
        updateConnectedUserList(userListFromBackend);
      });

      if (socket._callbacks !== undefined && socket._callbacks['$SEND_BACK_USER_SOCKET']) {
        socket._callbacks['$SEND_BACK_USER_SOCKET'].length = 0;
      }

      socket.on(SEND_BACK_USER_SOCKET, userAndSocket => {
        console.log(socket);
        console.log(userAndSocket);
        dispatch({ type: UPDATE_USERS_WITH_SOCKETS, payload: userAndSocket });
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
