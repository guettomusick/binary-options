import React from 'react';
import styled from 'styled-components';

import { useLoadBinContract } from './shared/hooks/useBinToken';
import Loading from './components/Loading';
import Buy from './components/Buy';
import Sell from './components/Sell';

const Container = styled.div`
  display: block;
  margin: auto;
  max-width: 800px;
  padding: 50px;
`;

const App = () => {
  const ready = useLoadBinContract();

  if (!ready) {
    return <Loading>Loading Contracts...</Loading>;
  }

  return (
    <Container>
      <Buy />
      <Sell />
    </Container>
  );
};

export default App;
