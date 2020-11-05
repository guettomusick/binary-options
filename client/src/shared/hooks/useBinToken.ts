import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers, Contract } from 'ethers';

import { useSigner } from './useWallet';
import { useAddContract } from './useAddContract';
import { useToken, useAddress as useBinaryOptionsAddress } from './useBinaryOptions';
import { setContract, setBalance, setAllowance } from '../redux/binToken';

import BinToken from '../../artifacts/contracts/BinToken.sol/BinToken.json';
import { useLoadingDialog } from './useDialog';

export const useGetBalance = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  const signer = useSigner();
  
  const getBalance = useCallback(async () => {
    if (contract && signer) {
      try {
        const address = await signer.getAddress();
        const balance = await contract.balanceOf(address);
        dispatch(setBalance(+ethers.utils.formatEther(balance)));
      } catch(error) {
        console.error(error);
      }
    }
  }, [dispatch, contract, signer]);

  return contract ? getBalance : false;
};

const useRegisterEvents = (contract: Contract | undefined) => {
  const signer = useSigner();
  const getBalance = useGetBalance();
  const getAllowance = useGetAllowance();

  useEffect(() => {
    if (contract && signer && getBalance && getAllowance) {
      (async () => {
        const address = await signer.getAddress();
        const filterFrom = contract.filters.Transfer(address, null);
        const filterTo = contract.filters.Transfer(null, address);

        contract.on(filterFrom, (event) => {
          console.log('Event Transfer fron', event);
          getBalance();
          getAllowance();
        });
        contract.on(filterTo, (event) => {
          console.log('Event Transfer to', event);
          getBalance();
          getAllowance();
        });
        getBalance();
      })();
    }
  }, [contract, signer, getBalance, getAllowance]);
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
  const { show, hide } = useLoadingDialog('Waiting for Approve transaction to complete');
  
  return useCallback(
    async (amount) => {
      if (contract && address && getAllowance) {
        try {
          show();
          const tx = await contract.approve(address, amount);
          const receipt = await tx.wait();
          await getAllowance();
          return { tx, receipt };
        } catch(error) {
          console.error(error);
        } finally {
          hide();
        }
      }
    },
    [contract, address, getAllowance, show, hide],
  );
};

export const useGetAllowance = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  const address = useBinaryOptionsAddress();
  const signer = useSigner();
  
  const getAllowance = useCallback(async () => {
    if (contract && signer) {
      try {
        const account = await signer.getAddress();
        const allowance = await contract.allowance(account, address);
        dispatch(setAllowance(+ethers.utils.formatEther(allowance)));
      } catch (error) {
        console.error(error);
      }
    }
  }, [dispatch, contract, signer, address]);

  return contract && address ? getAllowance : false;
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
    if (allowance < +amount) {
      approve(ethers.constants.MaxUint256);
      return false;
    }
    return true;
  }, [allowance, approve]);

  return needAllowance;
};

export const useNeedBalance = () => {
  const balance = useBalance();

  const needBalance = useCallback(
    (amount) => balance >= +amount,
    [balance],
  );

  return needBalance;
};