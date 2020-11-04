import React from 'react';

import NesContainer from '../shared/components/NesContainer';
import NesTitle from '../shared/components/NesTitle';
import NesIcon from '../shared/components/NesIcon';
import NesButton from '../shared/components/NesButton';
import NesAction from '../shared/components/NesAction';

import { useCollect, useSummary } from '../shared/hooks/useBinaryOptions';

const Collect = () => {
  const collect = useCollect();
  const { pending, readyToCollect, readyToCollectAmount } = useSummary();

  const disabled = !readyToCollect || !readyToCollectAmount || readyToCollect === 0 || readyToCollectAmount === 0;

  const collectHandler = () => {
    collect();
  }

  const pendingOptions = pending !== undefined && readyToCollect !== undefined
    ? pending-readyToCollect
    : '-';

  const readyToCollectOptions = readyToCollect !== undefined
    ? readyToCollect
    : '-';
  
  const amount = readyToCollectAmount !== undefined
    ? readyToCollectAmount
    : '-';

  return (
    <NesContainer className='is-dark with-title'>
      <NesTitle>Collect</NesTitle>
      <p>Pending Options: {pendingOptions}</p>
      <p>Ready to Collect Options: {readyToCollectOptions}</p>
      <p><NesIcon /> Ready to Collect Amount: {amount} BIN</p>
      <NesAction>
        <NesButton kind='primary' onClick={collectHandler} disabled={disabled}>Collect</NesButton>
      </NesAction>
    </NesContainer>
  )
};

export default Collect;