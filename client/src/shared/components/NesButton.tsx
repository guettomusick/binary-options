import React, { FC } from 'react';
import classnames from 'classnames';

type Props = {
  kind?: string,
  type?: 'button' | 'submit' | 'reset',
  disabled?: boolean,
  href?: string,
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
};

const Button: FC<Props> = ({
  href,
  type = 'button',
  disabled = false,
  kind,
  onClick,
  children,
}) => {
  if(href) {
    return (
      <a
        className=''
        href={href}
      >
        { children }
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classnames({
        'nes-btn': true,
        'is-primary': kind === 'primary',
        'is-success': kind === 'success',
        'is-warning': kind === 'warning',
        'is-error': kind === 'error',
        'is-disabled': disabled,
      })}
    >
      { children }
    </button>
  );
};

export default Button;