import React from 'react';
import ReactDOM from 'react-dom';
import { Drizzle } from '@drizzle/store';
import { drizzleReactHooks } from '@drizzle/react-plugin'

import BinaryOptions from './contracts/BinaryOptions.json';

import App from './App';
import Loading from './components/Loading';
import reportWebVitals from './reportWebVitals';

const options = {
  contracts: [BinaryOptions]
};
const drizzle = new Drizzle(options);

ReactDOM.render(
  <React.StrictMode>
    <drizzleReactHooks.DrizzleProvider drizzle={drizzle}>
      <drizzleReactHooks.Initializer
        // Optional `node` to render on errors. Defaults to `'Error.'`.
        error={ <Loading>There was an error!!</Loading> }
        // Optional `node` to render while loading contracts and accounts. Defaults to `'Loading contracts and accounts.'`.
        loadingContractsAndAccounts={ <Loading>Loading Contracts...</Loading> }
        // Optional `node` to render while loading `web3`. Defaults to `'Loading web3.'`.
        loadingWeb3={ <Loading>Loading Web3...</Loading> }
      >
        <App />
      </drizzleReactHooks.Initializer>
    </drizzleReactHooks.DrizzleProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
