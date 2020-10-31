import React from 'react';

import { useGetBinBalance, useNeedAllowance, useNeedBalance } from '../shared/hooks/useBinToken';
import { useGetPrice, useSell } from '../shared/hooks/useBinaryOptions';
import { useHandleChangeWithState } from '../shared/hooks/useHandleChange';

import NesContainer from '../shared/components/NesContainer';
import NesInput from '../shared/components/NesInput';
import NesButton from '../shared/components/NesButton';
import NesAction from '../shared/components/NesAction';

const Sell = () => {
  const price = useGetPrice();
  const balance = useGetBinBalance();
  const [sell] = useSell();
  const [{ amount }, changeAmountHandler, setData] = useHandleChangeWithState({amount: 0});
  const [needBalance] = useNeedBalance();
  const [needAllowance] = useNeedAllowance();

  const sellHandler = () => {
    if (!needBalance(amount)) {
      console.log('not enough bin');
      return;
    }
    
    if (!needAllowance(amount)) {
      console.log('need allowance');
      return;
    }
    
    console.log('sellHandler: sell');
    sell(amount);
  }

  const clearHandler = () => {
    setData({ amount: 0});
  }

  return (
    <NesContainer className='is-dark with-title'>
      <p className='title'>Sell BIN</p>
      <p>Sell BIN Token</p>
      <p><i className="nes-icon coin is-small"></i> Current Price: { price } ETH</p>
      <p><i className="nes-icon coin is-small"></i> Current Balance: { balance } BIN</p>
      <NesInput
        id='sell-amount'
        name='amount'
        type='number'
        dark
        onChange={changeAmountHandler}
        value={amount}
      >
        Amount
      </NesInput>
      <NesAction>
        <NesButton onClick={clearHandler}>Clear</NesButton>
        <NesButton kind='primary' onClick={sellHandler} disabled={!+amount}>Sell</NesButton>
      </NesAction>
    </NesContainer>
  );
};

export default Sell;
