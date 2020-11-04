import { createStore, combineReducers, compose } from 'redux';

import wallet from './wallet';
import binToken from './binToken';
import binaryOptions from './binaryOptions';
import priceFeed from './priceFeed';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  wallet,
  binToken,
  binaryOptions,
  priceFeed,
});

const store = createStore(
  rootReducer,
  composeEnhancers(),
);

export type AppState = ReturnType<typeof rootReducer>;
export default store;