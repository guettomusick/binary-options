// actions
const SET_WEB3 = 'SET_WEB3';
export const setWeb3 = (web3) => ({ type: SET_WEB3, payload: web3 });

// reducer
const initialState = null;

const web3 = (state = initialState, action) => {
  const { type, payload } = action;

  switch(type) {
    case SET_WEB3:
      return payload;
    default:
      return state;
  }
}

export default web3;
