import './css/App.css';

// React Router DOM
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Components
import Login from './Components/Login';
import ChatPage from './Components/ChatPage';
import Chat from './Components/Chat';

import AuthRoute from './util/AuthRoute';
import Spinner from './util/Spinner';

function App() {
  return (
    <Router>
      <div className='app'>
        <Switch>
          <AuthRoute exact path='/' component={Chat} />
          <AuthRoute exact path='/chat' component={Chat} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/spin' component={Spinner} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
