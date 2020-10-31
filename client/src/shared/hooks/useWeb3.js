import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Web3 from 'web3';

import { setWeb3 } from '../redux/web3';
import { setAccounts } from '../redux/accounts';

const getWeb3 = () =>
  new Promise( ( resolve, reject ) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener( 'load', async () => {
      // Modern dapp browsers...
      if ( window.ethereum ) {
        const web3 = new Web3( window.ethereum );
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve( web3 );
        } catch ( error ) {
          reject( error );
        }
      }
      // Legacy dapp browsers...
      else if ( window.web3 ) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        resolve( web3 );
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(
          'http://127.0.0.1:8545',
        );
        const web3 = new Web3( provider );
        resolve( web3 );
      }
    } );
  } );

export const useWeb3 = () => {
  const dispatch = useDispatch();
  const web3 = useSelector(state => state.web3);

  useEffect(() => {
    if (!web3) {
      getWeb3()
      .then((web3) => dispatch(setWeb3(web3)))
      .catch(console.error);
    }
  }, [dispatch, web3])

  return web3;
}

export const useAccounts = () => {
  const dispatch = useDispatch();
  const web3 = useWeb3();
  const accounts = useSelector(state => state.accounts);

  useEffect(() => {
    if (accounts.length === 0 && web3) {
      web3.eth.getAccounts()
        .then((accounts) => dispatch(setAccounts(accounts)))
        .catch(console.error);
    }
  }, [dispatch, web3, accounts.length])

  return accounts;
}

export const useAccount = (index = 0) => {
  const accounts = useAccounts();
  return accounts && accounts[index];
};
