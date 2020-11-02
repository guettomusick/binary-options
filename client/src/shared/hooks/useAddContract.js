import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useWeb3, useAccount } from './useWeb3';

export const useAddContract = (contract, action, contractInterface, address) => {
  const web3 = useWeb3();
  const account = useAccount();
  const dispatch = useDispatch();

  useEffect( () => {
    if ( web3 && account && !contract) {
      web3.eth.net.getId()
        .then(networkId => {
          const networks = contractInterface.networks;
          const contractAddress = address || networks && networks[networkId] && networks[networkId].address;

          if (contractAddress) {
            const instance = new web3.eth.Contract(
              contractInterface.abi,
              contractAddress,
              { from: account }
            );
            dispatch(action(instance));
          }
        } )
        .catch(console.error);
    }
  }, [dispatch, web3, account, contract, action, address, contractInterface.abi, contractInterface.networks] );

  return contract;
};