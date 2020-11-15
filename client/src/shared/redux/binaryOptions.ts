import { BinaryOptions } from '../types/typechain';

import { Action } from './types';

// actions
const SET_BINARY_OPTIONS_CONTRACT = 'SET_BINARY_OPTIONS_CONTRACT';
export const setContract = (contract: BinaryOptions) => ({ type: SET_BINARY_OPTIONS_CONTRACT, payload: contract });

const SET_BINARY_OPTIONS_TOKEN = 'SET_BINARY_OPTIONS_TOKEN';
export const setToken = (token: string) => ({ type: SET_BINARY_OPTIONS_TOKEN, payload: token });

const SET_BINARY_OPTIONS_PRICE = 'SET_BINARY_OPTIONS_PRICE';
export const setPrice = (price: number) => ({ type: SET_BINARY_OPTIONS_PRICE, payload: price });

const SET_BINARY_OPTIONS = 'SET_BINARY_OPTIONS';
export const setOptions = (options: Options) => ({ type: SET_BINARY_OPTIONS, payload: options });

const SET_BINARY_OPTIONS_SUMMARY = 'SET_BINARY_OPTIONS_SUMMARY';
export const setSummary = (options: Summary) => ({ type: SET_BINARY_OPTIONS_SUMMARY, payload: options });

const SET_BINARY_OPTIONS_PAYOUT = 'SET_BINARY_OPTIONS_PAYOUT';
export const setPayout = (timestamp: number, payout: Payout) => ({ type: SET_BINARY_OPTIONS_PAYOUT, payload: { timestamp, payout } });

const UPDATE_BINARY_OPTIONS_PAYOUT = 'UPDATE_BINARY_OPTIONS_PAYOUT';
export const updatePayout = (timestamp: number, payout: Payout) => ({ type: UPDATE_BINARY_OPTIONS_PAYOUT, payload: { timestamp, payout } });

export type Payout = {
  higher?: number,
  lower?: number,
};

export type Payouts = {
  [key: number]: Payout,
};

export type Option = {
  price: number,
  higher: boolean,
  execute: number,
  amount: number,
  id: number,
  payout: number,
  buyer: string,
  winner: boolean,
};

export type Round = {
  executed: boolean,
  price: number,
  higherAmount: number,
  lowerAmount: number,
};

export type Options = {
  pending: Option[],
  readyToCollect: Option[],
};

export type Summary = {
  pending?: number,
  readyToCollect?: number,
  readyToCollectAmount?: number,
};

export type BinaryOptionsStore = {
  contract?: BinaryOptions,
  token?: string,
  price?: number,
  options: Options,
  summary: Summary,
  payouts: Payouts,
};

// reducer
const initialState: BinaryOptionsStore = {
  options: {
    pending: [],
    readyToCollect: [],
  },
  summary: {},
  payouts: {},
};

const binaryOptions = (state = initialState, action: Action<any>) => {
  const { type, payload } = action;

  switch(type) {
    case SET_BINARY_OPTIONS_CONTRACT:
      return {
        ...state,
        contract: payload as BinaryOptions,
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
    case SET_BINARY_OPTIONS:
      return {
        ...state,
        options: payload as Options,
      };
    case SET_BINARY_OPTIONS_SUMMARY:
      return {
        ...state,
        summary: payload as Summary,
      };
    case SET_BINARY_OPTIONS_PAYOUT:
      if (state.payouts[payload.timestamp]) {
        return state;
      };

      state.payouts[payload.timestamp] = payload.payout;
      return { ...state };
    case UPDATE_BINARY_OPTIONS_PAYOUT:
      state.payouts[payload.timestamp] = payload.payout;
      return { ...state };
    default:
      return state;
  }
}

export default binaryOptions;
