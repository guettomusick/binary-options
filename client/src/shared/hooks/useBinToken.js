// import { useCallback, useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
// import BigNumber from 'bignumber.js';

import { useAddContract } from './useAddContract';
// import { ether } from '../constants';
import { useToken } from './useBinaryOptions';
import { setContract } from '../redux/binToken';

import BinToken from '../../contracts/BinToken.json';

export const useContract = () => {
  const token = useToken();
  const contract = useSelector(state => state.binToken.contract);

  return useAddContract(
    contract,
    setContract,
    BinToken,
    token,
  );
}

// export const useBinTokenContract = () => {
//   return drizzle.contracts[CONTRACT_NAME];
// }

// export const useLoadBinContract = () => {
//   const account = useAccount();
//   const contract = useBinTokenContract();
//   const token = useBinaryOptionsToken();

//   useEffect(() => {
//     if (token && !contract) {
//       const config = {
//         contractName: 'BinToken',
//         web3Contract: new drizzle.web3.eth.Contract(
//           BinToken.abi,
//           token,
//           { from: account }
//         )
//       };
//       const events = ['Transfer', 'Approval'];
      
//       drizzle.addContract(config, events); 
//     }
//   }, [token, contract, account]);

//   return !!contract;
// };

// export const useGetBinBalance = () => {
//   const account = useAccount();
//   const balance = useDrizzleCache(CONTRACT_NAME, 'balanceOf', account);
//   return balance && new BigNumber(balance).dividedBy(ether).toNumber() || 0;  
// };

// // export const useGetAllowance = () => {
// //   const account = useAccount();
// //   const { useCacheCall } = drizzleReactHooks.useDrizzle();
// //   const contract = useGetAddress();

// //   return new BigNumber(useCacheCall(CONTRACT_NAME, 'allowance', account, contract));
// // };

// // export const useNeedBalance = () => {
// //   const balance = useGetBinBalance();

// //   const needBalance = useCallback(
// //     (amount) => amount <= balance,
// //     [balance],
// //   );

// //   return [needBalance];
// // };

// // export const useNeedAllowance = () => {
// //   const allowance = useGetAllowance();
// //   const contract = useGetAddress();

// //   const transactionStack = drizzleReactHooks
// //     .useDrizzleState(({ transactionStack }) => ({ transactionStack }));
// //   const { drizzle } = drizzleReactHooks.useDrizzle();
// //   const [stackId, setStackId] = useState();

// //   const approve = useCallback((amount) =>
// //     setStackId(drizzle.contracts.BinToken.methods.approve.cacheSend(
// //       contract, amount,
// //     )),
// //     [drizzle.contracts.BinToken.methods.approve, contract],
// //   );

// //   const needAllowance = useCallback((amount) => {
// //     const intAmount = ether.multipliedBy(amount);
// //     if (intAmount > allowance) {
// //       approve(ether.toString());
// //       return false;
// //     }
// //     return true;
// //   }, [allowance, approve]);

// //   return [
// //     needAllowance,
// //     stackId && transactionStack[stackId],
// //     transactionStack,
// //   ];
// // };

// // export const useTransferEvents = () => {
// //   const account = useAccount();
// //   const { useCacheEvents } = drizzleReactHooks.useDrizzle()
  
// //   return useCacheEvents(
// //     CONTRACT_NAME,
// //     'Transfer',
// //     useMemo(() => 
// //       ({
// //         filter: { from: account },
// //         fromBlock: 0
// //       }),
// //       [account],
// //     ),
// //   );
// // }
