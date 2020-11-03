import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ethers } from 'ethers';

import { useProvider, useSigner } from './useWallet';

export const useAddContract = (contract, action, contractInterface, address) => {
  const provider = useProvider();
  const signer = useSigner();
  const dispatch = useDispatch();

  useEffect( () => {
    if ( provider && !contract) {
      (async () => {
        const { chainId } = await provider.getNetwork();
        const networks = contractInterface.networks;
        const contractAddress = address || (networks && networks[chainId] && networks[chainId].address);
        if (contractAddress) {
          const contractInstance = new ethers.Contract(contractAddress, contractInterface.abi, provider);
          const contractInstanceWithSigner = contractInstance.connect(signer);
          dispatch(action(contractInstanceWithSigner));
        }
      })();
    }
  }, [dispatch, provider, contract, action, address, signer, contractInterface.abi, contractInterface.networks] );

  return contract;
};