import { Action } from './types';

// actions
const DIALOG_TOGGLE = 'DIALOG_TOGGLE';
export const toggleDialog = (open?: boolean) => ({ type: DIALOG_TOGGLE, payload: open });

const DIALOG_SETUP = 'DIALOG_SETUP';
export const setupDialog = (data: Partial<DialogStore>) => ({ type: DIALOG_SETUP, payload: data});

type DialogStore = {
  open: boolean,
  title: string,
  text: string,
  showMenu: boolean,
  onConfirm?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onCancel?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
}

// reducer
const initialState: DialogStore = {
  open: false,
  title: '',
  text: '',
  showMenu: true,
};

const dialog = (state = initialState, action: Action<any>) => {
  const { type, payload } = action;

  switch(type) {
    case DIALOG_TOGGLE:
      return {
        ...state,
        open: payload !== undefined ? payload : !state.open,
      }
    case DIALOG_SETUP:
      return {
        ...state,
        ...payload,
      }
    default:
      return state;
  }
}

export default dialog;
