import { ethers } from 'ethers';

import * as fs from 'fs';

const mnemonic = fs.readFileSync('.secret').toString().trim();

import BinaryOptions from '../client/src/artifacts/contracts/BinaryOptions.sol/BinaryOptions.json';
import TestUniswapV2Pair from '../client/src/artifacts/contracts/TestUniswapV2Pair.sol/UniswapV2Pair.json';
import Networks from '../client/src/config/networks.json';

let prevRoundTime = 0;

async function main() {
  const provider = ethers.getDefaultProvider('rinkeby', {
    infura: '2ff6f33efc85489db0c63eb24d007492',
    alchemy: 'o7LxJAavPv1Ph5QH63qoARjG34LFovhC',
    etherscan: 'TT6YMAX5NUT1Z6YNEWJGBKPNBY37F531A6',
    quorum: 1,
  });
  const mainProvider = ethers.getDefaultProvider('homestead', {
    infura: '2ff6f33efc85489db0c63eb24d007492',
    alchemy: 'DezGhC3ZfQGL6yYQBVjlrakkxfe2gMuy',
    etherscan: 'TT6YMAX5NUT1Z6YNEWJGBKPNBY37F531A6',
    quorum: 1,
  });
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  const signer = wallet.connect(provider);
  const contract = new ethers.Contract(Networks.BinaryOptions['4'].address, BinaryOptions.abi, signer);
  const priceFeedContract = new ethers.Contract(Networks.UniswapV2Pair['4'].address, TestUniswapV2Pair.abi, signer);
  const mainPriceFeedContract = new ethers.Contract(Networks.UniswapV2Pair['1'].address, TestUniswapV2Pair.abi, mainProvider);

  setInterval(async () => {
    const lastRoundTime = Math.floor(Date.now()/1000/600)*600;
    if (prevRoundTime !== lastRoundTime) {
      try {
        const lastRound = await contract.rounds(lastRoundTime);
        if (!lastRound.executed && lastRound.options > 0) {
          await contract.executeRound(lastRoundTime);
          console.log(`Executed round ${lastRoundTime}`);
        } else {
          console.log(lastRound.executed
            ? `Round ${lastRoundTime} already executed`
            : `No options at Round ${lastRoundTime}`
          );
        }
        prevRoundTime = lastRoundTime;
      } catch(error) {}
    }
  }, 5000);

  mainPriceFeedContract
    .on('Swap', async () => {
      try {
        const {
          _reserve0: reserve0,
          _reserve1: reserve1,
          _blockTimestampLast: blockTimestampLast,
        } = await mainPriceFeedContract.getReserves();
        const price0CumulativeLast = await mainPriceFeedContract.price0CumulativeLast();
        const price1CumulativeLast = await mainPriceFeedContract.price1CumulativeLast();

        console.log('Swap: Update prices');

        // Reverse order to match 
        await priceFeedContract.setData(
          reserve1,
          reserve0,
          blockTimestampLast,
          price1CumulativeLast,
          price0CumulativeLast,
        )
      } catch (error) {}
    });
};

main();
