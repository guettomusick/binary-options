import React from 'react';

import { usePrice, useBuy, useSell } from '../shared/hooks/useBinaryOptions';
import { useBalance, useNeedAllowance, useNeedBalance } from '../shared/hooks/useBinToken';
import { useHandleChangeWithState } from '../shared/hooks/useHandleChange';

import NesContainer from '../shared/components/NesContainer';
import NesTitle from '../shared/components/NesTitle';
import NesIcon from '../shared/components/NesIcon';
import NesInput from '../shared/components/NesInput';
import NesButton from '../shared/components/NesButton';
import NesAction from '../shared/components/NesAction';
import Inline from  '../shared/components/Inline';
import NesRadioContainer from '../shared/components/NesRadioContainer';
import NesRadio from '../shared/components/NesRadio';

const BuySell = () => {
  const { price, getBin, getEth } = usePrice();
  const balance = useBalance();
  const buy = useBuy();
  const sell = useSell();
  const needBalance = useNeedBalance();
  const needAllowance = useNeedAllowance();
  const [{ amount, operation }, changeHandler, setData] = useHandleChangeWithState({amount: 0, operation: 'buy'});
  
  const buying = operation === 'buy';
  const converted = buying ? getBin(amount) : getEth(amount);
  const youGet = amount >= 0 && (
    <p>You get {converted > 0 ? `~${converted}` : '0'} {buying ? 'BIN' : 'ETH'}</p>
  );

  const clearHandler = () => {
    setData({ operation, amount: 0});
  };

  const buyHandler = () => {
    buy(amount);
    clearHandler();
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
    <NesContainer className='with-title'>
      <NesTitle>Buy or Sell BIN Token</NesTitle>
      <p><NesIcon /> Current Price: {price} ETH</p>
      <p><NesIcon /> Current Balance: {balance} BIN</p>
      <NesRadioContainer>
        <NesRadio name='operation' onChange={changeHandler} checked={operation === 'buy'} value='buy'>
          Buy
        </NesRadio>
        <NesRadio name='operation' onChange={changeHandler} checked={operation === 'sell'} value='sell'>
          Sell
        </NesRadio>
      </NesRadioContainer>
      <Inline>
        <NesInput
          id='buy-sell-amount'
          name='amount'
          type='number'
          onChange={changeHandler}
          value={amount}
          min='0'
        >
          Amount
        </NesInput>
        <p>{buying ? 'ETH' : 'BIN'}</p>
      </Inline>
      <NesAction>
        { youGet }
        <NesButton onClick={clearHandler}>Clear</NesButton>
        <NesButton kind='primary' onClick={buying ? buyHandler : sellHandler} disabled={!+amount}>
          {buying ? 'Buy' : 'Sell' }
        </NesButton>
      </NesAction>
    </NesContainer>
  )
};

export default BuySell;
