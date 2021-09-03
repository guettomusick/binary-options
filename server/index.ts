import { ethers } from 'ethers';

import * as fs from 'fs';

const mnemonic = fs.readFileSync('.secret').toString().trim();

import BinaryOptions from '../client/src/artifacts/contracts/BinaryOptions.sol/BinaryOptions.json';
import Networks from '../client/src/config/networks.json';

let prevRoundTime = 0;

async function main() {
  const provider = new ethers.providers.AlchemyProvider({
    ensAddress: 'https://polygon-mainnet.g.alchemy.com/v2/o7LxJAavPv1Ph5QH63qoARjG34LFovhC',
    chainId: 137,
    name: 'matic',
  });
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  const signer = wallet.connect(provider);
  const contract = new ethers.Contract(Networks.BinaryOptions['137'].address, BinaryOptions.abi, signer);

  const executeRound = async (timestamp: number) => {
    if (prevRoundTime !== timestamp) {
      try {
        const lastRound = await contract.rounds(timestamp);
        if (!lastRound.executed && lastRound.options > 0) {
          await contract.executeRound(timestamp);
          console.log(`Executed round ${timestamp}`);
        } else {
          console.log(lastRound.executed
            ? `Round ${timestamp} already executed`
            : `No options at Round ${timestamp}`
          );
        }
        prevRoundTime = timestamp;
      } catch(error) {
        console.error(error);
      }
    }
  }

  setInterval(() => executeRound(Math.floor(Date.now()/1000/600)*600), 5000);

  // Catchup
  let current = Date.now()-48*3600*1000;
    while(current < Date.now()) {
      executeRound(Math.floor(current/1000/600)*600);
      current += 600000;
    }
};

main();
