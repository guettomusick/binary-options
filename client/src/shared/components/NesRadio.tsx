import React, { FC } from 'react';
import classNames from 'classnames';

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
  <label>
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
  </label>
);

export default NesRadio;