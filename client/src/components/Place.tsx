import React from 'react';

import NesContainer from '../shared/components/NesContainer';
import NesTitle from '../shared/components/NesTitle';
import NesIcon from '../shared/components/NesIcon';
import NesInput from '../shared/components/NesInput';
import NesRadio from '../shared/components/NesRadio';
import NesRadioContainer from '../shared/components/NesRadioContainer';
import NesSelect from '../shared/components/NesSelect';
import NesButton from '../shared/components/NesButton';
import NesAction from '../shared/components/NesAction';
import Inline from  '../shared/components/Inline';

import { useBalance, useNeedAllowance, useNeedBalance } from '../shared/hooks/useBinToken';
import { useGetEthPrice } from '../shared/hooks/usePriceFeed';
import { useHandleChangeWithState } from '../shared/hooks/useHandleChange';
import { useGetRoundTimestamps, usePayOut, usePlace } from '../shared/hooks/useBinaryOptions';

const Place = () => {
  const balance = useBalance();
  const { price } = useGetEthPrice() || {};
  const timestamps = useGetRoundTimestamps();
  const place = usePlace();
  const needBalance = useNeedBalance();
  const needAllowance = useNeedAllowance();
  const [{ higher, timestamp, amount }, changeHandler, setData] = useHandleChangeWithState({
    higher: 'High',
    timestamp: '',
    amount: 0,
  });
  const payout = usePayOut(+timestamp);

  const clearHandler = () => {
    setData({
      higher: 'High',
      timestamp: '',
      amount: 0,
    })
  };

  const placeHandler = () => {
    if (!needBalance(amount)) {
      console.log('not enough bin');
      return;
    }
    
    if (!needAllowance(amount)) {
      console.log('need allowance');
      return;
    }

    place(timestamp, amount, higher === 'High');
    clearHandler();
  };

  const disabled = !+amount || !timestamp;

  return (
    <NesContainer className='with-title'>
      <NesTitle>Place Binary Option</NesTitle>
      <p><NesIcon /> ETH price: {price} ETH</p>
      <p><NesIcon /> Current Balance: {balance} BIN</p>
      <NesSelect
        id='timestamp'
        label='Round'
        value={timestamp}
        onChange={changeHandler}
        inline
      >
        { timestamps.map(ts => (
          <option value={ts} key={ts}>{ (new Date(ts*1000)).toLocaleString() }</option>
        ))}
      </NesSelect>
      <Inline>
        <NesInput
          id='place-amount'
          name='amount'
          type='number'
          onChange={changeHandler}
          value={amount}
          min='0'
        >
          Amount
        </NesInput>
        <p>BIN</p>
      </Inline>
      <NesRadioContainer>
        <NesRadio name='higher' onChange={changeHandler} checked={higher === 'High'} value='High'>
          High <span className='nes-text is-success'>[PO: { payout.higher ? `${payout.higher/1000}%` : '-'}]</span>
        </NesRadio>
        <NesRadio name='higher' onChange={changeHandler} checked={higher === 'Low'} value='Low'>
          Low <span className='nes-text is-success'>[PO: { payout.lower ? `${payout.lower/1000}%` : '-'}]</span>
        </NesRadio>
      </NesRadioContainer>
      <NesAction>
        <NesButton onClick={clearHandler}>Clear</NesButton>
        <NesButton kind='primary' onClick={placeHandler} disabled={disabled}>Place</NesButton>
      </NesAction>
    </NesContainer>
  )
};

export default Place;