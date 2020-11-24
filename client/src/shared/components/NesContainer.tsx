import React, { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin: 30px 0;
`;

type Props = {
  className?: string,
}

const NesContainer: FC<Props> = ({ children, className = '' }) => (
  <Container className={`nes-container ${className}`}>
    { children }
  </Container>
);

export default NesContainer;