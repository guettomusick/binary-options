import { useState } from 'react';

export type ChangeEvent = {
  target: {
    name: string,
    value: string,
    type?: string,
  },
};

type HandleChange = (event: ChangeEvent) => void;

export const useHandleChange =
  <T extends { [ key: string ]: any }>(data: T, setData: (data: T) => void): HandleChange => {
    return (event: ChangeEvent) => {
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
  };

export const useHandleChangeWithState = 
  <T extends Object>(dataInit: T): [T, HandleChange, React.Dispatch<React.SetStateAction<T>>] => {
    const [data, setData] = useState(dataInit);
    
    return [data, useHandleChange(data, setData), setData];
  };
