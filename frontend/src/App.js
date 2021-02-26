import './css/App.css';

// React Router DOM
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Components
import Login from './Components/Login';
import ChatPage from './Components/ChatPage';
import Chat from './Components/Chat';

// Util components
import AuthRoute from './util/AuthRoute';
import Spinner from './util/Spinner';

// moment.js
import moment from 'moment';
import 'moment/locale/nl';
moment.locale('nl');

function App() {
  return (
    <Router>
      <div className='app'>
        <Switch>
          <AuthRoute exact path='/' component={Chat} />
          <AuthRoute exact path='/chat' component={ChatPage} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/spin' component={Spinner} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
