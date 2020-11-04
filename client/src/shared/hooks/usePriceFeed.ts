import { Dispatch } from 'redux';
import { useEffect } from 'react';
import { Contract } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';

import { useAddContract } from './useAddContract';
import { setContract, setPrice } from '../redux/priceFeed';
import priceFeeds from '../../config/priceFeed.json';
import aggregatorV3Interface from '../../artifacts/contracts/AggregatorV3Interface.sol/AggregatorV3Interface.json';
import { useNetwork } from './useWallet';

const INTERVAL = 3000;

const getPriceFeed = async (contract: Contract, dispatch: Dispatch) => {
  const roundData = await contract.latestRoundData();
  dispatch(setPrice({
    price: roundData.answer ? roundData.answer.toNumber()/100000000 : 0,
    time: Date.now(),
  }));
};

type PriceFeed = {
  [key: string]: {
    eth: string,
  },
};

export const useGetEthPrice = () => {
  const dispatch = useDispatch();
  const contract = useContract();
  const current = useSelector(state => state.priceFeed.current);
  const { chainId } = useNetwork() || {};

  useAddContract(
    contract,
    setContract,
    aggregatorV3Interface,
    chainId ? (priceFeeds as PriceFeed)[chainId.toFixed(0)].eth : undefined,
  );

  useEffect(() => {
    if (contract) {
      if (!current) {
        getPriceFeed(contract, dispatch);
      } else {
        setTimeout(() => getPriceFeed(contract, dispatch), INTERVAL);
      }
    }
  }, [dispatch, contract, current]);

  return current;
};

export const useContract = () => useSelector(state => state.priceFeed.contract);