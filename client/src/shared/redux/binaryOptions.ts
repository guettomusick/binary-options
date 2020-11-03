import { Contract } from '@ethersproject/contracts';

import { Action } from './types';

// actions
const SET_BINARY_OPTIONS_CONTRACT = 'SET_BINARY_OPTIONS_CONTRACT';
export const setContract = (contract: Contract) => ({ type: SET_BINARY_OPTIONS_CONTRACT, payload: contract });

const SET_BINARY_OPTIONS_TOKEN = 'SET_BINARY_OPTIONS_TOKEN';
export const setToken = (token: string) => ({ type: SET_BINARY_OPTIONS_TOKEN, payload: token });

const SET_BINARY_OPTIONS_PRICE = 'SET_BINARY_OPTIONS_PRICE';
export const setPrice = (price: number) => ({ type: SET_BINARY_OPTIONS_PRICE, payload: price });

export type BinaryOptionsStore = {
  contract?: Contract,
  token?: string,
  price?: number,
}

// reducer
const initialState: BinaryOptionsStore = {};

const binaryOptions = (state = initialState, action: Action<any>) => {
  const { type, payload } = action;

  switch(type) {
    case SET_BINARY_OPTIONS_CONTRACT:
      return {
        ...state,
        contract: payload as Contract,
      };
    case SET_BINARY_OPTIONS_TOKEN:
      return {
        ...state,
        token: payload as string,
      };
    case SET_BINARY_OPTIONS_PRICE:
      return {
        ...state,
        price: payload as number,
      };
    default:
      return state;
  }
}

export default binaryOptions;
