import { useState } from 'react';

export function useHandleChange(data, setData) {
  return (event) => {
    if (!event.target) {
      return;
    }

    const { name, value, type } = event.target;

    if ( data.hasOwnProperty( name ) ) {
      setData( {
        ...data,
        [ name ]: type === 'checkbox' ? !data[ name ] : value,
      } );
    }
  };
}

export function useHandleChangeWithState(dataInit) {
  const [data, setData] = useState(dataInit);
  
  return [data, useHandleChange(data, setData), setData];
}
