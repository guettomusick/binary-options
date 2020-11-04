import React from 'react';
import styled from 'styled-components';

import { useInitializeWallet } from './shared/hooks/useWallet';
import { useInitializeContract as useBinaryOptionsContract } from './shared/hooks/useBinaryOptions';
import { useInitializeContract as useBinTokenContract } from './shared/hooks/useBinToken';

import Loading from './components/Loading';
import Buy from './components/Buy';
import Sell from './components/Sell';

const Container = styled.div`
  display: block;
  margin: auto;
  max-width: 800px;
  padding: 50px;
`;

const loading = (text: string) => <Loading>{ text }</Loading>;

const App = () => {
  const initialized = useInitializeWallet();
  const binaryOptionsContract = useBinaryOptionsContract();
  const binTokenContract = useBinTokenContract();

  if (!initialized) {
    return loading('Loading Ethers...');
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
