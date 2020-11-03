import { createStore, combineReducers, compose } from 'redux';

import wallet from './wallet';
import binToken from './binToken';
import binaryOptions from './binaryOptions';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  wallet,
  binToken,
  binaryOptions,
});

const store = createStore(
  rootReducer,
  composeEnhancers(),
);

export default store;