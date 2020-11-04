import { Contract } from '@ethersproject/contracts';

import { Action } from './types';

// actions
const SET_PRICE_FEED_CONTRACT = 'SET_PRICE_FEED_CONTRACT';
export const setContract = (contract: Contract) => ({ type: SET_PRICE_FEED_CONTRACT, payload: contract });

const SET_PRICE_FEED_ETH_PRICE = 'SET_PRICE_FEED_ETH_PRICE';
export const setPrice = (price: Price) => ({ type: SET_PRICE_FEED_ETH_PRICE, payload: price });

type Price = {
  price: number,
  time: number,
};

export type PriceFeedStore = {
  contract?: Contract,
  current?: Price,
}

// reducer
const initialState: PriceFeedStore = {};

const priceFeed = (state = initialState, action: Action<any>) => {
  const { type, payload } = action;

  switch(type) {
    case SET_PRICE_FEED_CONTRACT:
      return {
        ...state,
        contract: payload as Contract,
      };
    case SET_PRICE_FEED_ETH_PRICE:
      return {
        ...state,
        current: payload as Price,
      };
    default:
      return state;
  }
}

export default priceFeed;
