import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import chatMessageReducer from './reducers/chatMessageReducer';

const initialState = {};

const middleware = [thunk];

const reducers = combineReducers({
  data: chatMessageReducer,
  //   data: dataReducer,
  //   ui: uiReducer,
});

const store = createStore(
  reducers,
  initialState,
  compose(
    applyMiddleware(...middleware),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  ),
);

export default store;
