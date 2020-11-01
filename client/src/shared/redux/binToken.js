// actions
const SET_BIN_TOKEN_CONTRACT = 'SET_BIN_TOKEN_CONTRACT';
export const setContract = (contract) => ({ type: SET_BIN_TOKEN_CONTRACT, payload: contract });

const SET_BIN_TOKEN_BALANCE = 'SET_BIN_TOKEN_BALANCE';
export const setBalance = (balance) => ({ type: SET_BIN_TOKEN_BALANCE, payload: balance });

const SET_BIN_TOKEN_ALLOWANCE = 'SET_BIN_TOKEN_ALLOWANCE';
export const setAllowance = (allowance) => ({ type: SET_BIN_TOKEN_ALLOWANCE, payload: allowance });

// reducer
const initialState = {
  contract: null,
  balance: 0,
  allowance: 0,
};

const binToken = (state = initialState, action) => {
  const { type, payload } = action;

  switch(type) {
    case SET_BIN_TOKEN_CONTRACT:
      return {
        ...state,
        contract: payload,
      };
    case SET_BIN_TOKEN_BALANCE:
      return state.balance === payload ? state : {
        ...state,
        balance: payload,
      };
    case SET_BIN_TOKEN_ALLOWANCE:
      return state.allowance === payload ? state : {
        ...state,
        allowance: payload,
      };
    default:
      return state;
  }
}

export default binToken;
