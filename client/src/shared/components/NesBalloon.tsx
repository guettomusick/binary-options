import React, { FC } from 'react';
import classNames from 'classnames';

type Props = {
  left?: boolean,
  right?: boolean,
};

const NesBalloon: FC<Props> = ({
  left,
  right,
  children,
}) => (
  <section className={classNames({
      'message': true,
      '-left': left,
      '-right': right,
    })}
  >
    { left && <i className='nes-bcrikko' /> }
    <div
      className={classNames({
        'nes-balloon': true,
        'from-left': left,
        'from-right': right,
      })}
    >
      <p>{ children }</p>
    </div>
    { right && <i className='nes-bcrikko' /> }
  </section>
);

export default NesBalloon;
