import React, { FC } from 'react';
import styled from 'styled-components';

const Section = styled.section`
  display: flex;
  flex-direction: column;

  .message {
    display: flex;
    align-items: flex-end;
    margin-top: 2rem;

    &.-left {
      align-self: flex-start;
    }
    &.-right {
      align-self: flex-end;
    }
    .nes-balloon {
      flex: 1;

      &.from-left {
        margin-left: 20px;
      }
      &.from-right {
        margin-right: 20px;
      }
    }
  }
`;

const NesBallonSection: FC = ({ children }) => 
  <Section className='message-list'>{ children }</Section>;

export default NesBallonSection;