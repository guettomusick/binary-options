import React, { FC } from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

const Label = styled.label`
  margin-right: 10px;
`;

type Props = {
  name: string,
  value: string | number,
  checked?: boolean,
  dark?: boolean,
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
}

const NesRadio: FC<Props> = ({
  name,
  value,
  checked,
  dark,
  onChange,
  children,
}) => (
  <Label>
    <input
      type='radio'
      className={ classNames({
        'nes-radio': true,
        'is-dark': dark,
        })
      }
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
    />
    <span>{ children }</span>
  </Label>
);

export default NesRadio;