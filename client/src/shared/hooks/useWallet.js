import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';

import { setProvider, setSigner } from '../redux/wallet';

export const useInitializeWallet = () => {
  const dispatch = useDispatch();
  const { provider } = useSelector(state => state.wallet);

  useEffect(() => {
    if (!provider) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      dispatch(setProvider(provider));
      dispatch(setSigner(signer));
    }
  }, [dispatch, provider])

  return !!provider;
}

export const useProvider = () => useSelector(state => state.wallet.provider);
export const useSigner = () => useSelector(state => state.wallet.signer);