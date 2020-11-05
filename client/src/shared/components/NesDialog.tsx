import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';

import { toggleDialog } from '../redux/dialog';

import NesTitle from './NesTitle';
import NesButton from './NesButton';
import styled from 'styled-components';

type Props = {
  rounded?: boolean,
  dark?: boolean,
};

const Backdrop = styled.div`
  position: fixed;
  z-index: 10000;
  background-color: rgba(0,0,0,0.8);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  dialog {
    min-width: 300px;
  }
`;

const NesDialog: FC<Props> = ({
  rounded,
  dark,
}) => {
  const dispatch = useDispatch();
  const {
    open,
    title,
    text,
    showMenu,
    onConfirm,
    onCancel,
  }= useSelector(state => state.dialog);

  const cancelHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    dispatch(toggleDialog());
    onCancel && onCancel(event);
  }

  const confirmHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    dispatch(toggleDialog());
    onConfirm && onConfirm(event);
  }

  if (!open) {
    return null;
  }

  return (
    <Backdrop>
      <dialog open className={classNames({
          'nes-dialog': true,
          'is-rounded': rounded,
          'is-dark': dark,
        })}
      >
        <form method='dialog'>
          <NesTitle>{title}</NesTitle>
          <p>{text}</p>
          { showMenu && (
            <menu className="dialog-menu">
              <NesButton onClick={cancelHandler}>Cancel</NesButton>
              <NesButton kind='primary' onClick={confirmHandler}>Confirm</NesButton>
            </menu>
          )}
        </form>
      </dialog>
    </Backdrop>
  );
};

export default NesDialog;