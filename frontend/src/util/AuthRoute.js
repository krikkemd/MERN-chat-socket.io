// Redux
import { connect } from 'react-redux';

// Actions
import { getCurrentLoggedInUser } from '../redux/actions/authActions';

// React Router DOM
import { Redirect, Route } from 'react-router-dom';

// Components
import Spinner from './Spinner';

import { useEffect } from 'react';

// When we specify an Authroute:
//  - getCurrentLoggedInUser checks if the user is logged in. (componentDidMount)
//  - When the user is loading, show a spinner
//  - When props.authenticated._id === true, it means the user is logged in. Render the passed in component (props.component)
//  - When props.authenticated._id === false, it means the user is not logged in. redirect to /login

const AuthRoute = props => {
  // componentDidMount
  useEffect(() => {
    props.getCurrentLoggedInUser();
  }, []);

  // Render
  return (
    <Route
      render={() =>
        props.loading ? (
          <Spinner />
        ) : props.authenticated._id ? (
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
    authenticated: state.user.user,
    loading: state.user.loading,
  };
};

export default connect(mapStateToProps, { getCurrentLoggedInUser })(AuthRoute);
