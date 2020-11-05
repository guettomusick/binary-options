import React from 'react';
import styled from 'styled-components';

import { useInitializeWallet } from './shared/hooks/useWallet';
import { useExecute, useInitializeContract as useBinaryOptionsContract, useOptions } from './shared/hooks/useBinaryOptions';
import { useInitializeContract as useBinTokenContract } from './shared/hooks/useBinToken';

import Loading from './components/Loading';
import BuySell from './components/BuySell';
import Place from './components/Place';
import Collect from './components/Collect';
import NesDialog from './shared/components/NesDialog';
import NesBalloonSection from './shared/components/NesBalloonSection';
import NesBalloon from './shared/components/NesBalloon';

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
      <NesBalloonSection>
        <NesBalloon left>BIN Token is an ETH backed coin, BIN supply is governed only by binary options payments.</NesBalloon>
        <NesBalloon right>Tokens will be minted in case winner options cannot be payed, and will be burned if BIN contract balance increase.</NesBalloon>
      </NesBalloonSection>
      <BuySell/>
      <Place />
      <Collect />
      <NesDialog rounded/>
    </Container>
  );
};

export default App;
