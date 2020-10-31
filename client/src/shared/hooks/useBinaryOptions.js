import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import BigNumber from 'bignumber.js';

// import { ether } from '../constants';
import { useAddContract } from './useAddContract';
import { setContract, setToken } from '../redux/binaryOptions';

import BinaryOptions from '../../contracts/BinaryOptions.json';

export const useContract = () => {
  const contract = useSelector(state => state.binaryOptions.contract);

  return useAddContract(
    contract,
    setContract,
    BinaryOptions,
  );
}

export const useToken = () => {
  const dispatch = useDispatch();
  const contract = useContract();
  const token = useSelector(state => state.binaryOptions.token);
  
  useEffect(() => {
    if (!token && contract) {
      contract.methods.token().call()
        .then(token => {
          dispatch(setToken(token));
        })
        .catch(console.error);
    }
  }, [dispatch, contract, token]);

  return token;
};

// // export const useBinaryOptions = () => {
// //   const { contracts } = drizzleReactHooks.useDrizzleState(({ contracts }) => ({ contracts }));
// //   return contracts.BinaryOptions;
// // }

// export const useGetPrice = () => {
//   const price = useDrizzleCache(CONTRACT_NAME, 'getPrice', 0);
//   return price && new BigNumber(price).dividedBy(ether).toNumber() || 0;
// };

// export const useBuy = () => {
//   const [send, tx] = useDrizzleSend(CONTRACT_NAME, 'buy');

//   const buy = useCallback((amount) =>
//     send({ value: ether.multipliedBy(amount).toString() }),
//     [send],
//   );

//   return [ buy, tx ];
// };

// export const useSell = () => {
//   const transactionStack = drizzleReactHooks
//     .useDrizzleState(({ transactionStack }) => ({ transactionStack }));
//   const { drizzle } = drizzleReactHooks.useDrizzle();
//   const [stackId, setStackId] = useState();

//   const sell = useCallback((amount) =>
//     setStackId(drizzle.contracts.BinaryOptions.methods.sell.cacheSend(
//       ether.multipliedBy(amount).toString(),
//     )),
//     [drizzle.contracts.BinaryOptions.methods.sell],
//   );

//   return [
//     sell,
//     stackId && transactionStack[stackId],
//     transactionStack,
//   ];
// };

// export const useGetAddress = () => {
//   const { drizzle } = drizzleReactHooks.useDrizzle();
//   return drizzle.contracts.BinaryOptions.address;
// }
