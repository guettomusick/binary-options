import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin: 20px 0;
`;

const NesContainer = ({ children, className }) => (
  <Container className={`nes-container ${className}`}>
    { children }
  </Container>
);

export default NesContainer;