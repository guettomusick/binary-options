import { createStore, combineReducers, compose } from 'redux';

import web3 from './web3';
import accounts from './accounts';
import binToken from './binToken';
import binaryOptions from './binaryOptions';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  web3,
  accounts,
  binToken,
  binaryOptions,
});

const store = createStore(
  rootReducer,
  composeEnhancers(),
);

export default store;