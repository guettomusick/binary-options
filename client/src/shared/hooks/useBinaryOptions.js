import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';

import { ether } from '../constants';
import { useAccount } from './useWeb3';
import { useAddContract } from './useAddContract';
import { setContract, setToken, setPrice } from '../redux/binaryOptions';

import BinaryOptions from '../../artifacts/contracts/BinaryOptions.sol/BinaryOptions.json';
import networks from '../../artifacts/contracts/BinaryOptions.sol/networks.json';

export const useGetPrice = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  
  const getPrice = useCallback(() => {
    contract.methods.getPrice(0).call()
      .then((price) => dispatch(setPrice(new BigNumber(price).dividedBy(ether).toNumber() || 0)))
      .catch(console.error);
  }, [dispatch, contract]);

  return contract ? getPrice : false;
};

const useRegisterEvents = (contract) => {
  const account = useAccount();
  const getPrice = useGetPrice();

  useEffect(() => {
    if (contract && getPrice) {
      contract.events.Bought()
        .on('data', (event) => {
          console.log('Event Bought', event);
          getPrice();
        });
      contract.events.Sold()
        .on('data', (event) => {
          console.log('Event Sold', event);
          getPrice();
        });
      getPrice();
    }
  }, [account, contract, getPrice]);
};

export const useInitializeContract = () => {
  const contract = useSelector(state => state.binaryOptions.contract);
  useRegisterEvents(contract);

  BinaryOptions.networks = networks;

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
      contract.methods.token().call()
        .then(token => {
          dispatch(setToken(token));
        })
        .catch(console.error);
    }
  }, [dispatch, contract, token]);

  return token;
};

export const useAddress = () => {
  const contract = useContract();
  return contract && contract.options.address;
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

  const buy = useCallback((amount) =>
    contract.methods.buy().send({ value: ether.multipliedBy(amount).toFixed() })
      .on('transactionHash', (hash) => console.log('buy transactionHash', hash))
      .on('confirmation', (confirmationNumber, receipt) => console.log('buy confirmation', confirmationNumber, receipt))
      .on('receipt', (receipt) => console.log('buy receipt', receipt))
      .on('error', (error) => console.error('buy error', error)),
    [contract],
  );

  return buy;
};

export const useSell = () => {
  const contract = useContract();

  const sell = useCallback((amount) =>
    contract.methods.sell(ether.multipliedBy(amount).toFixed()).send()
      .on('transactionHash', (hash) => console.log('sell transactionHash', hash))
      .on('confirmation', (confirmationNumber, receipt) => console.log('sell confirmation', confirmationNumber, receipt))
      .on('receipt', (receipt) => console.log('sell receipt', receipt))
      .on('error', (error) => console.error('sell error', error)),
    [contract],
  );

  return sell;
};
