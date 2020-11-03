import React from 'react';

import { usePrice, useSell } from '../shared/hooks/useBinaryOptions';
import { useBalance, useNeedAllowance, useNeedBalance } from '../shared/hooks/useBinToken';
import { useHandleChangeWithState } from '../shared/hooks/useHandleChange';

import NesContainer from '../shared/components/NesContainer';
import NesTitle from '../shared/components/NesTitle';
import NesIcon from '../shared/components/NesIcon';
import NesInput from '../shared/components/NesInput';
import NesButton from '../shared/components/NesButton';
import NesAction from '../shared/components/NesAction';
import Inline from  '../shared/components/Inline';

const Sell = () => {
  const { price, getEth } = usePrice();
  const balance = useBalance();
  const sell = useSell();
  const [{ amount }, changeAmountHandler, setData] = useHandleChangeWithState({amount: 0});
  const needBalance = useNeedBalance();
  const needAllowance = useNeedAllowance();

  const eths = getEth(amount);

  const clearHandler = () => {
    setData({ amount: 0});
  };

  const sellHandler = () => {
    if (!needBalance(amount)) {
      console.log('not enough bin');
      return;
    }
    
    if (!needAllowance(amount)) {
      console.log('need allowance');
      return;
    }
    
    sell(amount);
    clearHandler();
  };

  return (
    <NesContainer className='is-dark with-title'>
      <NesTitle>Sell BIN</NesTitle>
      <p>Sell BIN Token</p>
      <p><NesIcon /> Current Price: { price } ETH</p>
      <p><NesIcon /> Current Balance: { balance } BIN</p>
      <Inline>
        <NesInput
          id='sell-amount'
          name='amount'
          type='number'
          dark
          onChange={changeAmountHandler}
          value={amount}
          min='0'
        >
          Amount
        </NesInput>
        <p>BIN</p>
      </Inline>
      <NesAction>
        { eths >= 0 && <p>You get {eths ? `~${eths}` : eths} ETH</p> }
        <NesButton onClick={clearHandler}>Clear</NesButton>
        <NesButton kind='primary' onClick={sellHandler} disabled={!+amount}>Sell</NesButton>
      </NesAction>
    </NesContainer>
  );
};

export default Sell;
