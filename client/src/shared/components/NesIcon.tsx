import React from 'react';

const NesIcon = ({
  icon = 'coin',
  size = 'small',
}) => (
  <i className={`nes-icon ${icon} is-${size}`} />
);

export default NesIcon;