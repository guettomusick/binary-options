import React from 'react';
import styled from 'styled-components';

import { useWeb3, useAccounts } from './shared/hooks/useWeb3';
import { useContract as useBinaryOptionsContract } from './shared/hooks/useBinaryOptions';
import { useContract as useBinTokenContract } from './shared/hooks/useBinToken';

import Loading from './components/Loading';
import Buy from './components/Buy';
import Sell from './components/Sell';

const Container = styled.div`
  display: block;
  margin: auto;
  max-width: 800px;
  padding: 50px;
`;

const loading = (text) => <Loading>{ text }</Loading>;

const App = () => {
  const web3 = useWeb3();
  const accounts = useAccounts();
  const binaryOptionsContract = useBinaryOptionsContract();
  const binTokenContract = useBinTokenContract();

  if (!web3) {
    return loading('Loading Web3...');
  }
  if (accounts.length === 0) {
    return loading('Loading Accounts...');
  }
  if (!binaryOptionsContract || !binTokenContract) {
    return loading('Loading Contracts...');
  }
  
  return (
    <Container>
      <Buy/>
      <Sell />
    </Container>
  );
};

export default App;
