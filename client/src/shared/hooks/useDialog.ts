import { useState, useCallback } from 'react';
import { useDispatch, useStore } from 'react-redux';

import { toggleDialog, setupDialog } from './../redux/dialog';

export const useLoadingDialog = (text: string) => {
  const dispatch = useDispatch();
  const [dotsInterval, setDotsInterval] = useState<NodeJS.Timeout>();
  const store = useStore();

  const show = useCallback(() => {
    dispatch(setupDialog({
      title: 'Loading',
      text,
      showMenu: false,
    }));
    setDotsInterval(setInterval(() => {
      const { title } = store.getState().dialog;
      const dots = title.replace('Loading', '').length;
      dispatch(setupDialog({
        title: dots === 3
          ? 'Loading'
          : 'Loading' + (new Array(dots+1)).fill('.').join(),
      }));
    }, 1000));
    dispatch(toggleDialog(true));
  }, [dispatch, store, text]);

  const hide = useCallback(() => {
    dotsInterval && clearInterval(dotsInterval);
    dispatch(toggleDialog(false));
  }, [dispatch, dotsInterval])

  return { show, hide };
};
