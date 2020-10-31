import React from 'react';

import { useGetPrice, useBuy } from '../shared/hooks/useBinaryOptions';
import { useGetBinBalance } from '../shared/hooks/useBinToken';
import { useHandleChangeWithState } from '../shared/hooks/useHandleChange';

import NesContainer from '../shared/components/NesContainer';
import NesTitle from '../shared/components/NesTitle';
import NesIcon from '../shared/components/NesIcon';
import NesInput from '../shared/components/NesInput';
import NesButton from '../shared/components/NesButton';
import NesAction from '../shared/components/NesAction';

const Buy = () => {
  const price = useGetPrice();
  const balance = useGetBinBalance();
  const [buy, TXObjects, transactionStack] = useBuy();
  const [{ amount }, changeAmountHandler, setData] = useHandleChangeWithState({amount: 0});

  console.log(TXObjects);
  console.log(transactionStack);

  const buyHandler = () => {
    buy(amount);
  }

  const clearHandler = () => {
    setData({ amount: 0});
  }

  return (
    <NesContainer className='with-title'>
      <NesTitle>Buy BIN</NesTitle>
      <p>Buy BIN Token</p>
      <p><NesIcon /> Current Price: {price} ETH</p>
      <p><NesIcon /> Current Balance: {balance} BIN</p>
      <NesInput
        id='buy-amount'
        name='amount'
        type='number'
        onChange={changeAmountHandler}
        value={amount}
      >
        Amount
      </NesInput>
      <NesAction>
        <NesButton onClick={clearHandler}>Clear</NesButton>
        <NesButton kind='primary' onClick={buyHandler} disabled={!+amount}>Buy</NesButton>
      </NesAction>
    </NesContainer>
  )
};

export default Buy;
