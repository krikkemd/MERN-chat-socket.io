import './css/App.css';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import darkTheme from './util/darkTheme';
import lightTheme from './util/lightTheme';
import Paper from '@material-ui/core/Paper';

// Redux
import { connect } from 'react-redux';

// React Router DOM
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Components
import Login from './Components/Login';
import Mui from './Components/Mui';

// Util components
import AuthRoute from './util/AuthRoute';
import UploadAvatar from './util/UploadAvatar';
import Spinner from './util/Spinner';
import ToggleTheme from './util/ToggleTheme';

// moment.js
import moment from 'moment';
import 'moment/locale/nl';
moment.locale('nl');

function App(props) {
  return (
    <Router>
      <ThemeProvider
        theme={props.theme === 'light' ? createMuiTheme(lightTheme) : createMuiTheme(darkTheme)}>
        <Paper style={{ height: '100vh' }}>
          <div className='app'>
            <Switch>
              <AuthRoute exact path='/' component={Mui} />
              <AuthRoute exact path='/upload' component={UploadAvatar} />
              <Route exact path='/login' component={Login} />
              <Route exact path='/spin' component={Spinner} />
            </Switch>
          </div>
          <ToggleTheme />
        </Paper>
      </ThemeProvider>
    </Router>
  );
}

const mapStateToProps = state => {
  return {
    theme: state.theme.theme,
  };
};

export default connect(mapStateToProps)(App);
