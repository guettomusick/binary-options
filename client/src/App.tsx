import React, {useState} from 'react';
import styled from 'styled-components';

import { useInitializeWallet } from './shared/hooks/useWallet';
import { useExecute, useInitializeContract as useBinaryOptionsContract, useOptions } from './shared/hooks/useBinaryOptions';
import { useInitializeContract as useBinTokenContract } from './shared/hooks/useBinToken';

import Loading from './components/Loading';
import NavBar from './components/NavBar';
import About from './components/About';
import Home from './components/Home';

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
  let home = true;
  let about = false;
  
  window.execute = (timestamp: number) => execute && execute(timestamp);

  const pageHomeHandler = () => {
    setPageDysplay("home");
  }
  const pageAboutHandler = () => {
    setPageDysplay("about");
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
    home = true;
    about = false; 
  } 
  
  if (pageDisplay === "about") {
    about = true;
    home = false;
  }

  return (
    <Container >
      <NavBar pageHomeHandler={pageHomeHandler}
              pageAboutHandler={pageAboutHandler}/>
      {about && <About />}
      {home && <Home />}
    </Container> 
  );
};

export default App;
