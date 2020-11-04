import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ethers, Contract } from 'ethers';

import { useProvider, useSigner } from './useWallet';
import { Action } from '../redux/types';

export type ContractInterface = {
  abi: any,
  networks?: {
    [key: number]: {
      address: string,
    },
  },
}

export const useAddContract = (
  contract: Contract | undefined,
  action: (contract: Contract) => Action<Contract>,
  contractInterface: ContractInterface,
  address?: string
) => {
  const provider = useProvider();
  const signer = useSigner();
  const dispatch = useDispatch();

  useEffect( () => {
    if ( provider && signer && !contract) {
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