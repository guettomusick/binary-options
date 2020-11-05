import { useGetBalance } from './useBinToken';
import { useLoadingDialog } from './useDialog';
import { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers, BigNumber, Contract } from 'ethers';

import { useAddContract } from './useAddContract';
import { setContract, setToken, setPrice, setOptions, setSummary, Option, setPayout, updatePayout } from '../redux/binaryOptions';

import BinaryOptions from '../../artifacts/contracts/BinaryOptions.sol/BinaryOptions.json';
import Networks from '../../config/networks.json';
import { useSigner } from './useWallet';

export const useGetPrice = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  
  const getPrice = useCallback(() => {
    if (contract) {
      contract.getPrice(0)
        .then((price: BigNumber) => dispatch(setPrice(+ethers.utils.formatEther(price || 0))))
        .catch(console.error);
    }
  }, [dispatch, contract]);

  return contract ? getPrice : false;
};

export const useGetOptions = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  const signer = useSigner();
  
  const getOptions = useCallback(async () => {
    if (contract && signer) {
      try {
        const address = await signer.getAddress();
        const pendingOptionsLength = await contract.getPendingOptionsLength(address);
        const collectedOptionsLength = await contract.getCollectedOptionsLength(address);

        const pendingOptions = [];
        const readyToCollectOptions = [];
        const collectedOptions = [];

        for (let i=0; i<pendingOptionsLength; i++) {
          const optionIndex = await contract.pendingOptions(address, i);
          const option = await contract.options(optionIndex);
          const round = await contract.rounds(option.execute);

          if (round.executed) {
            readyToCollectOptions.push(option);
          } else {
            pendingOptions.push(option);
          }
        }
        for (let i=0; i<collectedOptionsLength; i++) {
          const optionIndex = await contract.collectedOptions(address, i);
          const option = await contract.options(optionIndex);
          collectedOptions.push(option);
        }

        const optionsAdapter = (option: any): Option => ({
          price: option.price.toNumber()/100000000,
          higher: option.higher,
          execute: option.execute,
          amount: +ethers.utils.formatEther(option.amount),
          id: option.id,
          payout: option.payout.div(1000).toNumber(),
          buyer: option.buyer,
          winner: option.winner,
        })

        dispatch(setOptions({
          pending: pendingOptions.map(optionsAdapter),
          readyToCollect: readyToCollectOptions.map(optionsAdapter),
          collected: collectedOptions.map(optionsAdapter),
        }));
      } catch (error) {
        console.error(error);
      }
    }
  }, [dispatch, contract, signer]);

  return contract ? getOptions : false;
};

export const useGetSummary = () => {
  const contract = useContract();
  const dispatch = useDispatch();
  const signer = useSigner();

  const getSummary = useCallback(async () => {
    if (contract && signer) {
      const address = await signer.getAddress();
      const [readyToCollectLength, amount] = await contract.getReadyToCollect();
      const pendingLength = await contract.getPendingOptionsLength(address);

      dispatch(setSummary({
        pending: pendingLength.toNumber(),
        readyToCollect: readyToCollectLength.toNumber(),
        readyToCollectAmount: +ethers.utils.formatEther(amount),
      }));
    }
  }, [dispatch, contract, signer]);

  return contract ? getSummary : false;
};

export const useGetPayout = (action: Function) => {
  const dispatch = useDispatch();
  const contract = useContract();

  const getPayOut = useCallback(async (timestamp: number) => {
    if (contract && timestamp) {
      const higher = await contract.getPayOut(timestamp, true);
      const lower = await contract.getPayOut(timestamp, false);

      dispatch(action(timestamp, { higher, lower }));
    }
  }, [dispatch, contract, action]);

  return contract ? getPayOut : false;
};

const useRegisterEvents = (contract: Contract | undefined) => {
  const getPrice = useGetPrice();
  const getSummary = useGetSummary();
  const getOptions = useGetOptions();
  const getPayOut = useGetPayout(updatePayout);
  const signer = useSigner();

  useEffect(() => {
    if (contract && signer && getPrice && getSummary && getOptions && getPayOut) {
      (async () => {
        const address = await signer.getAddress();
        contract.on('Bought', getPrice);
        contract.on('Sold', getPrice);

        const optionsUpdate = () => {
          getSummary();
          getOptions();
        }

        contract.on('Execute', optionsUpdate);
        const filterPlace = contract.filters.Place(address);
        contract.on(filterPlace, (event, timestamp) => {
          optionsUpdate();
          getPayOut(timestamp);
        });
        const filterCollect = contract.filters.Collect(address);
        contract.on(filterCollect, optionsUpdate);
        getPrice();
        optionsUpdate();
      })();
    }
  }, [contract, signer, getPrice, getSummary, getOptions, getPayOut]);
};

export const useInitializeContract = () => {
  const contract = useSelector(state => state.binaryOptions.contract);
  useRegisterEvents(contract);

  const networks = Networks.BinaryOptions;

  return useAddContract(
    contract,
    setContract,
    { ...BinaryOptions, networks },
  );
}

export const useContract = () => useSelector(state => state.binaryOptions.contract);

export const useToken = () => {
  const dispatch = useDispatch();
  const contract = useContract();
  const token = useSelector(state => state.binaryOptions.token);
  
  useEffect(() => {
    if (!token && contract) {
      contract.token()
        .then((token: string) => dispatch(setToken(token)))
        .catch(console.error);
    }
  }, [dispatch, contract, token]);

  return token;
};

export const useAddress = () => {
  const contract = useContract();
  return contract && contract.address;
}

export const usePrice = () => {
  const price = useSelector(state => state.binaryOptions.price);
  
  const getEth = useCallback((bins) => price ? bins*price : false, [price]);
  const getBin = useCallback((eth) => price ? eth/price : false, [price]);
  
  return {
    price,
    getEth,
    getBin,
  }
};

export const useBuy = () => {
  const contract = useContract();
  const getBalance = useGetBalance();
  const { show, hide } = useLoadingDialog('Waiting for Buy transaction to complete');

  const buy = useCallback( 
    async (amount) => {
      if (contract && getBalance) {
        try {
          show();
          const tx = await contract.buy({ value: ethers.utils.parseEther(amount) })
          const receipt = await tx.wait();
          await getBalance();
          return { tx, receipt };
        } catch(error) {
          console.error(error);
        } finally {
          hide();
        }
      }
    },
    [contract, show, hide, getBalance],
  );

  return buy;
};

export const useSell = () => {
  const contract = useContract();
  const getBalance = useGetBalance();
  const { show, hide } = useLoadingDialog('Waiting for Sell transaction to complete');

  const sell = useCallback(
    async (amount) => {
      if (contract && getBalance) {
        try {
          show();
          const tx = await contract.sell(ethers.utils.parseEther(amount));
          const receipt = await tx.wait();
          await getBalance();
          return { tx, receipt };
        } catch(error) {
          console.error(error);
        } finally {
          hide();
        }
      }
    },
    [contract, show, hide, getBalance],
  );

  return sell;
};

const useUpdateOptionsAndPayout = () => {
  const getSummary = useGetSummary();
  const getOptions = useGetOptions();
  const getPayOut = useGetPayout(updatePayout);

  return useCallback(async (timestamp?: number) => {
    if (getSummary && getOptions && getPayOut) {
      await getSummary();
      await getOptions();
      if (timestamp) {
        await getPayOut(timestamp);
      }
    }
  }, [getSummary, getOptions, getPayOut]);
}

export const usePlace = () => {
  const contract = useContract();
  const update = useUpdateOptionsAndPayout();
  const { show, hide } = useLoadingDialog('Waiting for Place transaction to complete');

  const place = useCallback(
    async (timestamp, amount, higher) => {
      if (contract) {
        try {
          show();
          const tx = await contract.place(timestamp, ethers.utils.parseEther(amount), higher);
          const receipt = await tx.wait();
          await update(timestamp);
          return { tx, receipt };
        } catch(error) {
          console.error(error);
        } finally {
          hide();
        }
      }
    },
    [contract, show, hide, update],
  );

  return place;
};

export const useCollect = () => {
  const contract = useContract();
  const update = useUpdateOptionsAndPayout();
  const { show, hide } = useLoadingDialog('Waiting for Collect transaction to complete');

  const collect = useCallback(
    async () => {
      if (contract) {
        try {
          show();
          const tx = await contract.collect();
          const receipt = await tx.wait();
          await update();
          return { tx, receipt };
        } catch(error) {
          console.error(error);
        } finally {
          hide();
        }
      }
    },
    [contract, show, hide, update],
  );

  return collect;
};

const getTimestamps = () => {
  const base = Math.ceil(Date.now()/600/1000)*600;
  return (new Array<number>(5)).fill(0).map((v, i) => base + (i+1)*600);
}

export const useGetRoundTimestamps = () => {
  const [timestamps, setTimestamps] = useState(getTimestamps());

  useEffect(() => {
    setTimeout(() => setTimestamps(getTimestamps()), 5000);
  }, [timestamps])

  return timestamps;
}

export const useOptions = () => {
  return useSelector(state => state.binaryOptions.options);
};

export const useSummary = () => {
  return useSelector(state => state.binaryOptions.summary);
};

export const useExecute = () => {
  const contract = useContract();

  const execute = useCallback(
    async (timestamp) => {
      if (contract) {
        try {
          const tx = await contract.executeRound(timestamp);
          console.log(tx);
          const receipt = await tx.wait();
          console.log(receipt);
          return { tx, receipt };
        } catch(error) {
          console.error(error);
        }
      }
    },
    [contract],
  );

  return execute;
};

export const usePayOut = (timestamp: number) => {
  const payout = useSelector(state => state.binaryOptions.payouts[timestamp]);
  const getPayOut = useGetPayout(setPayout);

  useEffect(() => {
    if (!payout && getPayOut) {
      getPayOut(timestamp);
    }
  }, [payout, getPayOut, timestamp]);

  return payout || {};
};
