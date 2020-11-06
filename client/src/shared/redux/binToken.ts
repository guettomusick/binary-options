import { BinToken } from '../types/typechain';

import { Action } from './types';

// actions
const SET_BIN_TOKEN_CONTRACT = 'SET_BIN_TOKEN_CONTRACT';
export const setContract = (contract: BinToken) => ({ type: SET_BIN_TOKEN_CONTRACT, payload: contract });

const SET_BIN_TOKEN_BALANCE = 'SET_BIN_TOKEN_BALANCE';
export const setBalance = (balance: number) => ({ type: SET_BIN_TOKEN_BALANCE, payload: balance });

const SET_BIN_TOKEN_ALLOWANCE = 'SET_BIN_TOKEN_ALLOWANCE';
export const setAllowance = (allowance: number) => ({ type: SET_BIN_TOKEN_ALLOWANCE, payload: allowance });

export type BinTokenStore = {
  contract?: BinToken,
  balance: number,
  allowance: number,
}

// reducer
const initialState: BinTokenStore = {
  balance: 0,
  allowance: 0,
};

const binToken = (state = initialState, action: Action<any>) => {
  const { type, payload } = action;

  switch(type) {
    case SET_BIN_TOKEN_CONTRACT:
      return {
        ...state,
        contract: payload as BinToken,
      };
    case SET_BIN_TOKEN_BALANCE:
      return state.balance === payload ? state : {
        ...state,
        balance: payload as number,
      };
    case SET_BIN_TOKEN_ALLOWANCE:
      return state.allowance === payload ? state : {
        ...state,
        allowance: payload as number,
      };
    default:
      return state;
  }
}

export default binToken;
