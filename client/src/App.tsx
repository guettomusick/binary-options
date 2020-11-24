import React, {useState} from 'react';
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
import NesContainer from './shared/components/NesContainer';
import NavBar from './components/NavBar';

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
  const [pageDisplay, setPageDysplay] = useState("home");
  const initialized = useInitializeWallet();
  const binaryOptionsContract = useBinaryOptionsContract();
  const binTokenContract = useBinTokenContract();
  const execute = useExecute();
  let home = null;
  let about = null;
  
  window.execute = (timestamp: number) => execute && execute(timestamp);

  const pageClickHandler = (pageSelected: string) => {
    
    
    setPageDysplay(pageSelected);
  }
  
  const options = useOptions();
  console.log(options);

  if (!initialized) {
    return loading('Loading Ethers...');
  }
  if (!binaryOptionsContract || !binTokenContract) {
    return loading('Loading Contracts...');
  }

  if (pageDisplay === "home") {
    home = (
      <NesContainer>
        <NesBalloonSection>
          <NesBalloon left>BIN Token is an ETH backed coin, BIN supply is governed only by binary options payments.</NesBalloon>
          <NesBalloon right>Tokens will be minted in case winner options cannot be payed, and will be burned if BIN contract balance increase.</NesBalloon>
        </NesBalloonSection>
        <BuySell/>
        <Place />
        <Collect />
        <NesDialog rounded/>
      </NesContainer>
    );
    about = null; 
  } else {
    about = (
      <NesContainer>
          <p style={{textDecoration: 'underline'}}>About</p>
          <NesBalloonSection>
            <NesBalloon left>A binary option is a financial product where the buyer receives a payout or loses their investment based on whether the option expires in the money.</NesBalloon>
            <NesBalloon right>Binary options depend on the outcome of a "yes or no" proposition, hence the name "binary." Binary options have an expiry date and/or time, in our case we have both.</NesBalloon>
          </NesBalloonSection>
        </NesContainer>
    );
    home = null;
  }
  
  return (
    <Container >
      <NavBar />
      <nav style={{height: '50px', marginTop: '50px'}}>
        <button onClick={() => pageClickHandler('home')}>
          Home
        </button>
        <button onClick={() => pageClickHandler('about')}>
          About  
        </button>
      </nav>
      {about}
      {home}
    </Container> 
  );
};

export default App;
