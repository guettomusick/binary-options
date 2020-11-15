import { Dispatch } from 'redux';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import UniswapV2Pair from '@uniswap/v2-core/build/UniswapV2Pair.json'

import { useAddContract } from './useAddContract';
import { setContract, setPrice } from '../redux/priceFeed';
import Networks from '../../config/networks.json';
import { useNetwork } from './useWallet';
import { useContract as useBinaryOptionsContract } from './useBinaryOptions';
import { BinaryOptions } from '../types/typechain';

const getPriceFeed = async (contract: BinaryOptions, dispatch: Dispatch) => {
  const { 0: price } = await contract.getEthPrice();
  dispatch(setPrice({
    price: price ? price.toNumber()/1000000000 : 0,
    time: Date.now(),
  }));
};

type UniswapV2PairInformation = {
  [key: number]: {
    address: string,
  },
};

export const useGetEthPrice = () => {
  const dispatch = useDispatch();
  const contract = useContract();
  const binaryOptionsContract = useBinaryOptionsContract();
  const current = useSelector(state => state.priceFeed.current);
  const { chainId } = useNetwork() || {};

  useAddContract(
    contract,
    setContract,
    UniswapV2Pair,
    chainId ? (Networks.UniswapV2Pair as UniswapV2PairInformation)[chainId].address : undefined,
  );

  useEffect(() => {
    if (contract && binaryOptionsContract) {
      if (!current) {
        getPriceFeed(binaryOptionsContract, dispatch);
      }
      contract.on('Swap', async () => {
        await getPriceFeed(binaryOptionsContract, dispatch);
      });
    }
  }, [dispatch, contract, binaryOptionsContract, current]);

  return current;
};

export const useContract = () => useSelector(state => state.priceFeed.contract);