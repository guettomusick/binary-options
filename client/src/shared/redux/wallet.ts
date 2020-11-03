import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';

import { Action } from './types';

// actions
const SET_PROVIDER = 'SET_PROVIDER';
export const setProvider = (provider: Provider) => ({ type: SET_PROVIDER, payload: provider });

const SET_SIGNER = 'SET_SIGNER';
export const setSigner = (signer: Signer) => ({ type: SET_SIGNER, payload: signer });

const SET_ACCOUNTS = 'SET_ACCOUNTS';
export const setAccounts = (accounts: string[]) => ({ type: SET_ACCOUNTS, payload: accounts });

type WalletStore = {
  provider?: Provider,
  signer?: Signer,
  accounts?: string[],
}

// reducer
const initialState: WalletStore = {};

const wallet = (state = initialState, action: Action<any>) => {
  const { type, payload } = action;

  switch(type) {
    case SET_PROVIDER:
      return {
        ...state,
        provider: payload as Provider,
      }
    case SET_SIGNER:
      return {
        ...state,
        signer: payload as Signer,
      }
    case SET_ACCOUNTS:
      return {
        ...state,
        accounts: payload as string[],
      }
    default:
      return state;
  }
}

export default wallet;
