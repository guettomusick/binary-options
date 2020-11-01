// actions
const SET_BINARY_OPTIONS_CONTRACT = 'SET_BINARY_OPTIONS_CONTRACT';
export const setContract = (contract) => ({ type: SET_BINARY_OPTIONS_CONTRACT, payload: contract });

const SET_BINARY_OPTIONS_TOKEN = 'SET_BINARY_OPTIONS_TOKEN';
export const setToken = (token) => ({ type: SET_BINARY_OPTIONS_TOKEN, payload: token });

const SET_BINARY_OPTIONS_PRICE = 'SET_BINARY_OPTIONS_PRICE';
export const setPrice = (price) => ({ type: SET_BINARY_OPTIONS_PRICE, payload: price });

// reducer
const initialState = {
  contract: null,
  token: null,
};

const binaryOptions = (state = initialState, action) => {
  const { type, payload } = action;

  switch(type) {
    case SET_BINARY_OPTIONS_CONTRACT:
      return {
        ...state,
        contract: payload,
      };
    case SET_BINARY_OPTIONS_TOKEN:
      return {
        ...state,
        token: payload,
      };
    case SET_BINARY_OPTIONS_PRICE:
      return {
        ...state,
        price: payload,
      };
    default:
      return state;
  }
}

export default binaryOptions;
