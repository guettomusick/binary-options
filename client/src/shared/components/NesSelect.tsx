import React, { FC } from 'react';
import styled, { css } from 'styled-components';
import classNames from 'classnames';

type ContainerProps = {
  dark?: boolean,
};

type Props = {
  id: string,
  name?: string,
  label?: string,
  value: string | number,
  dark?: boolean,
  inline?: boolean,
  validation?: string,
  placeholder?: string,
  required?: boolean,
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void,
};

const Container = styled.div<ContainerProps>`
  margin: 5px 0;
  
  ${({dark}) => dark && css`
    background-color:#212529;
    padding: 1rem 1.2rem 1rem 1rem;
    width:calc(100% + 8px);
  `}
`;

const NesSelect: FC<Props> = ({
  id,
  name,
  label,
  value,
  dark,
  inline,
  validation,
  placeholder = 'Select...',
  required,
  onChange,
  children,
}) => (
  <Container
    dark={dark}
    className={classNames({
      'nes-field': true,
      'is-inline': inline,
    })}>
    { label && <label htmlFor={id}>{label}</label> }
    <div 
      className={classNames({
        'nes-select': true,
        'is-dark': dark,
        'is-success': validation === 'success',
        'is-warning': validation === 'warning',
        'is-error': validation === 'error',
      })}
    >
      <select required={required} id={id} name={name || id} onChange={onChange} value={value}>
        <option value='' disabled hidden>{placeholder}</option>
        { children }
      </select>
    </div>
  </Container>
);

export default NesSelect;
