import React, { FC } from 'react';
import styled, { css } from 'styled-components';
import classnames from 'classnames';

type StyledProps = {
  dark: boolean,
};

type Props = {
  id: string,
  name?: string,
  dark?: boolean,
  inline?: boolean,
  type?: string,
  placeholder?: string,
  value?: string | number,
  validation?: 'success' | 'warning' | 'error',
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
  min?: string | number,
};

const NesInputContainer = styled.div<StyledProps>`
  flex-grow: 1;
  margin: 0;
  margin: 5px 0;

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }

  ${({dark}) => dark && css`
    background-color: #212529;
    padding: 1rem;
    margin: -1rem;

    label {
      color: white;
    }
  `}
`;

const NesInput: FC<Props> = ({
  id,
  name,
  dark = false,
  inline = true,
  children,
  type = 'text',
  placeholder,
  value,
  validation,
  onChange,
  min,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (min && min >= 0 && event.charCode === 45) {
      event.preventDefault()
      return false;
    }
    return true;
  }
  return (
    <NesInputContainer
      className={classnames({
        'nes-field': true,
        'is-inline': inline,
      })}
      dark={dark}
    >
      <label htmlFor={id}>
        {children}
      </label>
      <input
        type={type}
        id={id}
        className={classnames({
          'nes-input': true,
          'is-dark': dark,
          'is-success': validation === 'success',
          'is-warning': validation === 'warning',
          'is-error': validation === 'error',
        })}
        min={min}
        name={name || id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
      />
    </NesInputContainer>
  );
};

export default NesInput;
