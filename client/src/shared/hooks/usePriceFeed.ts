import { BinaryOptions } from './../types/typechain/BinaryOptions.d';
import { Dispatch } from 'redux';
import { useEffect } from 'react';
import { useContract } from './useBinaryOptions';
import { useSelector, useDispatch } from 'react-redux';

import { setPrice } from '../redux/priceFeed';

const INTERVAL = 3000;

const getPriceFeed = async (contract: BinaryOptions, dispatch: Dispatch) => {
  const ethPrice = await contract.getEthPrice();
  dispatch(setPrice({
    price: ethPrice ? ethPrice.toNumber()/1000 : 0,
    time: Date.now(),
  }));
};

export const useGetEthPrice = () => {
  const dispatch = useDispatch();
  const contract = useContract();
  const current = useSelector(state => state.priceFeed.current);

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