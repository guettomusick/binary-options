import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers, BigNumberish, Contract } from 'ethers';

import { useSigner } from './useWallet';
import { useAddContract } from './useAddContract';
import { useToken, useAddress as useBinaryOptionsAddress } from './useBinaryOptions';
import { setContract, setBalance, setAllowance } from '../redux/binToken';

import BinToken from '../../artifacts/contracts/BinToken.sol/BinToken.json';

export const useGetBalance = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  const signer = useSigner();
  
  const getBalance = useCallback(async () => {
    if (contract && signer) {
      const address = await signer.getAddress();
      contract.balanceOf(address)
        .then((balance: BigNumberish) => dispatch(setBalance(+ethers.utils.formatUnits(balance, 18))))
        .catch(console.error);
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
  
  return useCallback(
    async (amount) => {
      if (contract && address && getAllowance) {
        try {
          const tx = await contract.approve(address, amount);
          const receipt = tx.wait().then(getAllowance);
          return { tx, receipt };
        } catch(error) {
          console.error(error);
        }
      }
    },
    [contract, address, getAllowance],
  );
};

export const useGetAllowance = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  const address = useBinaryOptionsAddress();
  const signer = useSigner();
  
  const getAllowance = useCallback(async () => {
    if (contract && signer) {
      const account = await signer.getAddress();
      contract.allowance(account, address)
        .then((allowance: BigNumberish) => dispatch(setAllowance(+ethers.utils.formatUnits(allowance, 18))))
        .catch(console.error);
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