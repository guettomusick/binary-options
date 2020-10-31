// actions
const SET_BIN_TOKEN_CONTRACT = 'SET_BIN_TOKEN_CONTRACT';
export const setContract = (contract) => ({ type: SET_BIN_TOKEN_CONTRACT, payload: contract });

// reducer
const initialState = {
  contract: null,
};

const binToken = (state = initialState, action) => {
  const { type, payload } = action;

  switch(type) {
    case SET_BIN_TOKEN_CONTRACT:
      return {
        ...state,
        contract: payload,
      };
    default:
      return state;
  }
}

export default binToken;
