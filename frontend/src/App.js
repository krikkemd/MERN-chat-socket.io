import './css/App.css';

// React Router DOM
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Components
import Login from './Components/Login';
import ChatPage from './Components/ChatPage';

function App() {
  return (
    <Router>
      <div className='app'>
        <Switch>
          <Route path='/login' component={Login} />
          <Route path='/chatPage' component={ChatPage} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
