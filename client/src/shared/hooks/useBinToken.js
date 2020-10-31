import { useCallback, useState } from 'react';
import { drizzleReactHooks } from '@drizzle/react-plugin'

import { useAccount } from './useWeb3';
import { ether } from '../constants';
import { useGetAddress } from './useBinaryOptions';

import BinToken from '../../contracts/BinToken.json';

export const useLoadBinContract = () => {
  const account = useAccount();
  const { drizzle, useCacheCall } = drizzleReactHooks.useDrizzle();
  const token = useCacheCall('BinaryOptions', 'token');

  if (token && !drizzle.contracts.BinToken) {
    const config = {
      contractName: 'BinToken',
      web3Contract: new drizzle.web3.eth.Contract(
        BinToken.abi,
        token,
        { from: account }
      )
    };
    drizzle.addContract(config);
  }

  return !!drizzle.contracts.BinToken;
};

export const useGetBinBalance = () => {
  const account = useAccount();
  const { useCacheCall } = drizzleReactHooks.useDrizzle();
  const balance = useCacheCall('BinToken', 'balanceOf', account);

  return balance/ether;
};

export const useGetAllowance = () => {
  const account = useAccount();
  const { useCacheCall } = drizzleReactHooks.useDrizzle();
  const contract = useGetAddress();

  return useCacheCall('BinToken', 'allowance', account, contract);
};

export const useNeedBalance = () => {
  const balance = useGetBinBalance();

  const needBalance = useCallback(
    (amount) => amount <= balance,
    [balance],
  );

  return [needBalance];
};

export const useNeedAllowance = () => {
  const allowance = useGetAllowance();
  const contract = useGetAddress();

  const transactionStack = drizzleReactHooks
    .useDrizzleState(({ transactionStack }) => ({ transactionStack }));
  const { drizzle } = drizzleReactHooks.useDrizzle();
  const [stackId, setStackId] = useState();

  const approve = useCallback((amount) =>
    setStackId(drizzle.contracts.BinToken.methods.approve.cacheSend(
      contract, amount,
    )),
    [drizzle.contracts.BinToken.methods.approve, contract],
  );

  const needAllowance = useCallback((amount) => {
    const intAmount = amount*ether;
    if (intAmount > allowance) {
      approve(intAmount);
      return false;
    }
    return true;
  }, [allowance, approve]);

  return [
    needAllowance,
    stackId && transactionStack[stackId],
    transactionStack,
  ];
};
