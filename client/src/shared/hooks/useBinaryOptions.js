import { useCallback, useState } from 'react';
import { drizzleReactHooks } from '@drizzle/react-plugin'
import { ether } from '../constants';

export const useBinaryOptions = () => {
  const { contracts } = drizzleReactHooks.useDrizzleState(({ contracts }) => ({ contracts }));
  return contracts.BinaryOptions;
}

export const useGetPrice = () => {
  const { useCacheCall } = drizzleReactHooks.useDrizzle();

  return useCacheCall('BinaryOptions', 'getPrice')/ether;
};

export const useBuy = () => {
  const transactionStack = drizzleReactHooks
    .useDrizzleState(({ transactionStack }) => ({ transactionStack }));
  const { drizzle } = drizzleReactHooks.useDrizzle();
  const [stackId, setStackId] = useState();

  const buy = useCallback((amount) =>
    setStackId(drizzle.contracts.BinaryOptions.methods.buy.cacheSend({
      value: Math.round(amount*ether)
    })),
    [drizzle.contracts.BinaryOptions.methods.buy],
  );

  return [
    buy,
    stackId && transactionStack[stackId],
    transactionStack,
  ];
};

export const useSell = () => {
  const transactionStack = drizzleReactHooks
    .useDrizzleState(({ transactionStack }) => ({ transactionStack }));
  const { drizzle } = drizzleReactHooks.useDrizzle();
  const [stackId, setStackId] = useState();

  const sell = useCallback((amount) =>
    setStackId(drizzle.contracts.BinaryOptions.methods.sell.cacheSend(
      Math.round(amount*ether),
    )),
    [drizzle.contracts.BinaryOptions.methods.sell],
  );

  return [
    sell,
    stackId && transactionStack[stackId],
    transactionStack,
  ];
};

export const useGetAddress = () => {
  const { drizzle } = drizzleReactHooks.useDrizzle();
  return drizzle.contracts.BinaryOptions.address;
}
