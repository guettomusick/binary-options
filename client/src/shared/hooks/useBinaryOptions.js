import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ethers from 'ethers';

import { useAddContract } from './useAddContract';
import { setContract, setToken, setPrice } from '../redux/binaryOptions';

import BinaryOptions from '../../artifacts/contracts/BinaryOptions.sol/BinaryOptions.json';
import networks from '../../config/networks.json';

export const useGetPrice = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  
  const getPrice = useCallback(() => {
    contract.getPrice(0)
      .then((price) => dispatch(setPrice(ethers.utils.formatUnits(price || 0, 18))))
      .catch(console.error);
  }, [dispatch, contract]);

  return contract ? getPrice : false;
};

const useRegisterEvents = (contract) => {
  const getPrice = useGetPrice();

  useEffect(() => {
    if (contract && getPrice) {
      contract.on('Bought', getPrice);
      contract.on('Sold', getPrice);
      getPrice();
    }
  }, [contract, getPrice]);
};

export const useInitializeContract = () => {
  const contract = useSelector(state => state.binaryOptions.contract);
  useRegisterEvents(contract);

  BinaryOptions.networks = networks.BinaryOptions;

  return useAddContract(
    contract,
    setContract,
    BinaryOptions,
  );
}

export const useContract = () => useSelector(state => state.binaryOptions.contract);

export const useToken = () => {
  const dispatch = useDispatch();
  const contract = useContract();
  const token = useSelector(state => state.binaryOptions.token);
  
  useEffect(() => {
    if (!token && contract) {
      contract.token()
        .then(token => dispatch(setToken(token)))
        .catch(console.error);
    }
  }, [dispatch, contract, token]);

  return token;
};

export const useAddress = () => {
  const contract = useContract();
  return contract && contract.address;
}

export const usePrice = () => {
  const price = useSelector(state => state.binaryOptions.price);
  
  const getEth = useCallback((bins) => price ? bins*price : false, [price]);
  const getBin = useCallback((eth) => price ? eth/price : false, [price]);
  
  return {
    price,
    getEth,
    getBin,
  }
};

export const useBuy = () => {
  const contract = useContract();

  const buy = useCallback( 
    async (amount) => {
      try {
        const tx = await contract.buy({ value: ethers.utils.parseUnits(amount, 18) })
        const receipt = tx.wait();
        return { tx, receipt };
      } catch(error) {
        console.error(error);
      }
    },
    [contract],
  );

  return buy;
};

export const useSell = () => {
  const contract = useContract();

  const sell = useCallback(
    async (amount) => {
      try {
        const tx = await contract.sell(ethers.utils.parseUnits(amount, 18));
        const receipt = tx.wait();
        return { tx, receipt };
      } catch(error) {
        console.error(error);
      }
    },
    [contract],
  );

  return sell;
};
