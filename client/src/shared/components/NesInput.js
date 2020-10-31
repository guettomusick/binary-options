import React from 'react';
import styled, { css } from 'styled-components';
import classnames from 'classnames';

const NesInputContainer = styled.div`
  ${({dark}) => dark && css`
    background-color: #212529;
    padding: 1rem;

    label {
      color: white;
    }
  `}
`;

const NesInput = ({
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
}) => (
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
      name={name || id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </NesInputContainer>
);

export default NesInput;
