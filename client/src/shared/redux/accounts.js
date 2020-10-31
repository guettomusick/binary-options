// actions
const SET_ACCOUNTS = 'SET_ACCOUNTS';
export const setAccounts = (accounts) => ({ type: SET_ACCOUNTS, payload: accounts });

// reducer
const initialState = [];

const accounts = (state = initialState, action) => {
  const { type, payload } = action;

  switch(type) {
    case SET_ACCOUNTS:
      return payload;
    default:
      return state;
  }
}

export default accounts;
