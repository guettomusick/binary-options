import React from 'react';
import styled from 'styled-components';
import NesIcon from '../shared/components/NesIcon';

const HeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9;
  border-bottom: 4px solid #D3D3D3;
  background-color: #EEE;

  .container {
    display: flex;
    align-items: baseline;
    max-width: 980px;
    margin: 0 auto;
    padding-top: 1rem;
    transition: all 0.2s ease;

    .nes-icon {
      margin-right: 26px;
      margin-bottom: 26px;
      transform: scale(2);
    }

    .nav-brand {
      margin-right: auto;
      display: flex;
      flex-direction: row;
    }
  }
`;

const Header = () => (
  <HeaderContainer>
    <div className='container'>
      <div className='nav-brand'>
        <NesIcon/>
        <h2>Binary Options</h2>
      </div>
    </div>
  </HeaderContainer>
);

export default Header;
