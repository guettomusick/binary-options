import styled, { css } from 'styled-components';

type Props = {
  dark?: boolean,
};

const NesRadioContainer = styled.div<Props>`
  margin: 5px 0;

  ${({dark}) => dark && css`
    background-color:#212529;
    padding: 1rem 0;
  `}
`;

export default NesRadioContainer;