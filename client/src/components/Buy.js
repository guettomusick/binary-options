import React from 'react';

import { usePrice, useBuy } from '../shared/hooks/useBinaryOptions';
import { useBalance } from '../shared/hooks/useBinToken';
import { useHandleChangeWithState } from '../shared/hooks/useHandleChange';

import NesContainer from '../shared/components/NesContainer';
import NesTitle from '../shared/components/NesTitle';
import NesIcon from '../shared/components/NesIcon';
import NesInput from '../shared/components/NesInput';
import NesButton from '../shared/components/NesButton';
import NesAction from '../shared/components/NesAction';
import Inline from  '../shared/components/Inline';

const Buy = () => {
  const { price, getBin } = usePrice();
  const balance = useBalance();
  const buy = useBuy();
  const [{ amount }, changeAmountHandler, setData] = useHandleChangeWithState({amount: 0});

  const bins = getBin(amount);

  const clearHandler = () => {
    setData({ amount: 0});
  };

  const buyHandler = () => {
    buy(amount);
    clearHandler();
  };

  return (
    <NesContainer className='with-title'>
      <NesTitle>Buy BIN</NesTitle>
      <p>Buy BIN Token</p>
      <p><NesIcon /> Current Price: {price} ETH</p>
      <p><NesIcon /> Current Balance: {balance} BIN</p>
      <Inline>
        <NesInput
          id='buy-amount'
          name='amount'
          type='number'
          onChange={changeAmountHandler}
          value={amount}
          min='0'
        >
          Amount
        </NesInput>
        <p>ETH</p>
      </Inline>
      <NesAction>
        { bins >= 0 && <p>You get {bins ? `~${bins}` : bins} BIN</p> }
        <NesButton onClick={clearHandler}>Clear</NesButton>
        <NesButton kind='primary' onClick={buyHandler} disabled={!+amount}>Buy</NesButton>
      </NesAction>
    </NesContainer>
  )
};

export default Buy;
