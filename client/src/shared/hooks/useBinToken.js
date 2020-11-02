import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';

import { useAccount } from './useWeb3';
import { useAddContract } from './useAddContract';
import { ether } from '../constants';
import { useToken, useAddress as useBinaryOptionsAddress } from './useBinaryOptions';
import { setContract, setBalance, setAllowance } from '../redux/binToken';

import BinToken from '../../artifacts/contracts/BinToken.sol/BinToken.json';

export const useGetBalance = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  const account = useAccount();
  
  const getBalance = useCallback(() => {
    contract.methods.balanceOf(account).call()
      .then((balance) => dispatch(setBalance(new BigNumber(balance || 0).dividedBy(ether).toNumber())))
      .catch(console.error);
  }, [dispatch, contract, account]);

  return contract && account ? getBalance : false;
};

const useRegisterEvents = (contract) => {
  const account = useAccount();
  const getBalance = useGetBalance();
  const getAllowance = useGetAllowance();

  useEffect(() => {
    if (account && contract && getBalance && getAllowance) {
      contract.events.Transfer({ filter: { from: account} })
        .on('data', (event) => {
          console.log('Event Transfer', event);
          getBalance();
          getAllowance();
        });
      contract.events.Transfer({ filter: { to: account} })
        .on('data', (event) => {
          console.log('Event Transfer', event);
          getBalance();
          getAllowance();
        });
      getBalance();
    }
  }, [account, contract, getBalance, getAllowance]);
};

export const useInitializeContract = () => {
  const token = useToken();
  const contract = useSelector(state => state.binToken.contract);
  useRegisterEvents(contract);

  return useAddContract(
    contract,
    setContract,
    BinToken,
    token,
  );
};

export const useContract = () => useSelector(state => state.binToken.contract);

export const useBalance = () => {
  return useSelector(state => state.binToken.balance);
};

export const useApprove = () => {
  const contract = useContract();
  const getAllowance = useGetAllowance();
  const address = useBinaryOptionsAddress();
  
  return useCallback(
    (amount) => {
      if (contract && address && getAllowance) {
        contract.methods.approve(address, amount).send()
          .on('transactionHash', (hash) => console.log('approve transactionHash', hash))
          .on('confirmation', (confirmationNumber, receipt) => {
            getAllowance();
            console.log('approve confirmation', confirmationNumber, receipt)
          })
          .on('receipt', (receipt) => console.log('approve receipt', receipt))
          .on('error', (error) => console.error('approve error', error));
      }
    },
    [contract, address, getAllowance],
  );
};

export const useGetAllowance = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  const account = useAccount();
  const address = useBinaryOptionsAddress();
  
  const getAllowance = useCallback(() => {
    contract.methods.allowance(account, address).call()
      .then((allowance) => dispatch(setAllowance(new BigNumber(allowance || 0).dividedBy(ether).toNumber())))
      .catch(console.error);
  }, [dispatch, contract, account, address]);

  return contract && account && address ? getAllowance : false;
};

export const useNeedAllowance = () => {
  const approve = useApprove();
  const allowance = useSelector(state => state.binToken.allowance);
  const getAllowance = useGetAllowance();

  useEffect(() => {
    if (getAllowance) {
      getAllowance();
    }
  }, [getAllowance]);

  const needAllowance = useCallback((amount) => {
    if (allowance < amount) {
      approve(ether.multipliedBy(1000).toFixed());
      return false;
    }
    return true;
  }, [allowance, approve]);

  return needAllowance;
};

export const useNeedBalance = () => {
  const balance = useBalance();

  const needBalance = useCallback(
    (amount) => balance >= amount,
    [balance],
  );

  return needBalance;
};