import React from 'react';
import styled from 'styled-components';

import { useInitializeWallet } from './shared/hooks/useWallet';
import { useExecute, useInitializeContract as useBinaryOptionsContract, useOptions } from './shared/hooks/useBinaryOptions';
import { useInitializeContract as useBinTokenContract } from './shared/hooks/useBinToken';

import Loading from './components/Loading';
import Buy from './components/Buy';
import Sell from './components/Sell';
import Place from './components/Place';
import Collect from './components/Collect';

const Container = styled.div`
  display: block;
  margin: auto;
  max-width: 800px;
  padding: 50px;
`;

const loading = (text: string) => <Loading>{ text }</Loading>;

declare global {
  interface Window {
    execute?: any;
  }
}

const App = () => {
  const initialized = useInitializeWallet();
  const binaryOptionsContract = useBinaryOptionsContract();
  const binTokenContract = useBinTokenContract();
  const execute = useExecute();

  window.execute = (timestamp: number) => execute && execute(timestamp);

  const options = useOptions();
  console.log(options);

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
      <Place />
      <Collect />
    </Container>
  );
};

export default App;
