import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

import { setProvider, setSigner, setAccounts } from '../redux/wallet';

export const gasPrice = ethers.utils.parseUnits('5', 'gwei');

export const useInitializeWallet = () => {
  const dispatch = useDispatch();
  const { provider } = useSelector(state => state.wallet);

  useEffect(() => {
    if (!provider && window.ethereum) {
      (async () => {
        const ethereum: any = await detectEthereumProvider();
        if (ethereum) {
          ethereum.autoRefreshOnNetworkChange = false;
          const accounts = await ethereum.request({ method: 'eth_requestAccounts'});
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          dispatch(setProvider(provider));
          dispatch(setSigner(signer));
          dispatch(setAccounts(accounts));

          ethereum.on('accountsChanged', () => {
            window.location.reload();
          });

          ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        } else {
          console.log('Please install MetaMask!');
        }
      })();
    }
  }, [dispatch, provider])

  return !!provider;
}

export const useProvider = () => useSelector(state => state.wallet.provider);
export const useSigner = () => useSelector(state => state.wallet.signer);

export const useNetwork = () => {
  const provider = useProvider();
  const [network, setNetwork] = useState<ethers.providers.Network | undefined>();

  useEffect(() => {
    if (provider) {
      provider.getNetwork().then((network) => setNetwork(network));
    }
  }, [provider]);

  return network;
}