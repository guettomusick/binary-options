// actions
const SET_PROVIDER = 'SET_PROVIDER';
export const setProvider = (provider) => ({ type: SET_PROVIDER, payload: provider });

const SET_SIGNER = 'SET_SIGNER';
export const setSigner = (signer) => ({ type: SET_SIGNER, payload: signer });

const SET_ACCOUNTS = 'SET_ACCOUNTS';
export const setAccounts = (accounts) => ({ type: SET_ACCOUNTS, payload: accounts });

// reducer
const initialState = {};

const wallet = (state = initialState, action) => {
  const { type, payload } = action;

  switch(type) {
    case SET_PROVIDER:
      return {
        ...state,
        provider: payload,
      }
    case SET_SIGNER:
      return {
        ...state,
        signer: payload,
      }
    case SET_ACCOUNTS:
      return {
        ...state,
        accounts: payload,
      }
    default:
      return state;
  }
}

export default wallet;
